import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const PRIMARY_MODEL = "gemini-1.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

export async function POST(req) {
  try {
    const { postLink } = await req.json();
    if (!postLink) {
      return NextResponse.json(
        { error: "Post link is required" },
        { status: 400 }
      );
    }

    // Get LinkedIn access token + LinkedIn user ID from session
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken || session?.account?.access_token;
    const linkedinId = session?.user?.linkedinId;

    if (!accessToken || !linkedinId) {
      return NextResponse.json(
        { error: "LinkedIn authentication required" },
        { status: 401 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const prompt = `You are a LinkedIn expert. Analyze the post at this link: ${postLink} 
Then create a short, catchy, and engaging comment (2–3 sentences max) that:
- Encourages discussion
- Sounds natural in LinkedIn culture
- Is positive and relatable
Do NOT include hashtags or emojis unless contextually necessary. Only return the comment text.`;

    let result;
    try {
      const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
      result = await model.generateContent(prompt);
    } catch (error) {
      console.warn(
        "Primary model failed, switching to fallback:",
        error.message
      );
      const fallbackModel = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
      result = await fallbackModel.generateContent(prompt);
    }

    const comment = (await result.response.text()).trim();

    // Extract LinkedIn activity URN from different link formats
    let activityId = null;

    // Case 1: URN link format
    let match = postLink.match(/urn:li:activity:(\d+)/);
    if (match) activityId = match[1];

    // Case 2: Pretty URL format "...-activity-1234567890-..."
    if (!activityId) {
      match = postLink.match(/activity-(\d+)/);
      if (match) activityId = match[1];
    }

    if (!activityId) {
      return NextResponse.json(
        { error: "Invalid LinkedIn post link format" },
        { status: 400 }
      );
    }

    const encodedActivityUrn = encodeURIComponent(
      `urn:li:activity:${activityId}`
    );

    const linkedinRes = await fetch(
      `https://api.linkedin.com/v2/socialActions/${encodedActivityUrn}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          actor: `urn:li:person:${linkedinId}`, // ✅ use real LinkedIn person ID
          message: {
            text: comment,
          },
        }),
      }
    );

    if (!linkedinRes.ok) {
      const errText = await linkedinRes.text();
      return NextResponse.json(
        { error: "Failed to post comment to LinkedIn", details: errText },
        { status: linkedinRes.status }
      );
    }

    const postedData = await linkedinRes.json();

    return NextResponse.json({
      success: true,
      comment,
      postedData,
      message: "Comment posted successfully to LinkedIn",
    });
  } catch (error) {
    console.error("Analyze & Post Error:", error);
    return NextResponse.json(
      { error: "Error generating or posting comment" },
      { status: 500 }
    );
  }
}
