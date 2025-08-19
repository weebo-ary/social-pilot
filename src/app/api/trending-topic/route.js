// app/api/trending-topics/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";

const PRIMARY_MODEL = "gemini-1.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "SocialPilot-Trending/1.0" },
});

// Keep the list short + high-signal so prompts stay compact
const FEEDS = [
  "https://news.ycombinator.com/rss",
  "https://techcrunch.com/feed/",
  "https://www.theverge.com/rss/index.xml",
  "https://www.wired.com/feed/rss",
  "https://www.reuters.com/technology/rss",
  "https://www.bloomberg.com/feeds/podcasts/tech.xml",
  "https://www.fastcompany.com/technology/rss",
];

function todayIST() {
  // Reliable YYYY-MM-DD for Asia/Kolkata without deps
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // "YYYY-MM-DD"
}

async function fetchHeadlines() {
  const items = [];
  for (const url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      for (const it of (feed.items || []).slice(0, 5)) {
        items.push({
          title: it.title?.trim() || "",
          link: it.link || "",
          source: feed.title || "",
          snippet:
            (it.contentSnippet || it.content || it.summary || "").slice(0, 280),
        });
      }
    } catch {
      // Ignore feed errors individually to stay resilient
    }
  }
  // Deduplicate by title
  const seen = new Set();
  return items.filter((i) => {
    const key = i.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return i.title && i.link;
  });
}

function buildResearchPrompt(headlines) {
  const corpus = headlines
    .map(
      (h, idx) =>
        `${idx + 1}. ${h.title}\n   ${h.snippet}\n   ${h.link} [${h.source}]`
    )
    .join("\n");

  return `
You are a senior LinkedIn strategist and industry analyst.
You will receive a corpus of news headlines/snippets/links from reputable sources.
Synthesize DEEP daily themes for LinkedIn professionals in a way that's:
- Cross-industry aware (tech, business, AI, product, design, marketing)
- Actionable for career/brand growth
- Noise-filtered (avoid one-off quirks)
- Clear about why it matters on LinkedIn (hiring, GTM, strategy, productivity, leadership, creator economy)

STEP-BY-STEP (do this internally):
1) Cluster headlines into themes (with overlap detection).
2) Rank themes by likely LinkedIn engagement value (e.g., career impact, tool adoption, hiring signals).
3) For each theme, write a precise 3–5 sentence summary with insight.
4) Propose 4–6 relevant hashtags (LinkedIn flavor).
5) Add a confidence score (0.0–1.0).
6) Include 3–5 representative source links.

Return STRICT JSON ONLY (no prose, no code fences) as an array of objects:
[
  {
    "topic": "string",
    "summary": "string",
    "why_it_matters": "string",
    "suggested_hashtags": ["#Tag1", "#Tag2"],
    "confidence": 0.0,
    "sources": [{"title":"string","url":"string"}]
  }
]

CORPUS:
${corpus}
  `.trim();
}

async function generateWithFallback(prompt, genAI) {
  let model, result;
  try {
    model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    result = await model.generateContent(prompt);
  } catch {
    model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
    result = await model.generateContent(prompt);
  }
  return result.response.text();
}

function safeParseJSON(text) {
  // Strip fences if any
  let cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "");
  // Add quotes around hashtags that are not already quoted
  cleaned = cleaned.replace(/(?<=[:,\[]\s*)#(\w+)/g, '"#$1"');
  return JSON.parse(cleaned);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "1";
    const day = todayIST();

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1) Serve cached for today unless refresh requested
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from("trending_topics")
        .select("topics")
        .eq("day", day)
        .maybeSingle();

      if (cached?.topics) {
        return NextResponse.json({ day, topics: cached.topics, cached: true });
      }
    }

    // 2) Build fresh research
    const headlines = await fetchHeadlines();
    if (headlines.length === 0) {
      return NextResponse.json(
        { error: "No headlines fetched; try again later." },
        { status: 503 }
      );
    }

    const prompt = buildResearchPrompt(headlines);
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const text = await generateWithFallback(prompt, genAI);

    let topics = safeParseJSON(text);

    // Light validation/normalization
    if (!Array.isArray(topics)) topics = [];
    topics = topics.slice(0, 8).map((t) => ({
      topic: t.topic?.trim() || "",
      summary: t.summary?.trim() || "",
      why_it_matters: t.why_it_matters?.trim() || "",
      suggested_hashtags:
        (Array.isArray(t.suggested_hashtags) ? t.suggested_hashtags : [])
          .map((x) => String(x || "").trim())
          .filter(Boolean)
          .map((x) => (x.startsWith("#") ? x : `#${x}`))
          .slice(0, 6),
      confidence: Math.max(
        0,
        Math.min(1, Number.isFinite(t.confidence) ? t.confidence : 0.7)
      ),
      sources: (Array.isArray(t.sources) ? t.sources : [])
        .slice(0, 5)
        .map((s) => ({
          title: String(s?.title || "").trim(),
          url: String(s?.url || "").trim(),
        }))
        .filter((s) => s.title && s.url),
    }));

    // 3) Upsert for the day
    await supabase
      .from("trending_topics")
      .upsert({ day, topics }, { onConflict: "day" });

    return NextResponse.json({ day, topics, cached: false });
  } catch (error) {
    console.error("Trending topics error:", error);
    return NextResponse.json(
      { error: "Error building trending topics" },
      { status: 500 }
    );
  }
}