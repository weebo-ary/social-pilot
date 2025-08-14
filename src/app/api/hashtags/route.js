// app/api/trending-hashtags/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const PRIMARY_MODEL = "gemini-1.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const prompt = `You are a LinkedIn social media strategist.
Generate 10 trending hashtags for LinkedIn today based on:
- Current events
- Professional topics
- Tech & business trends
- Motivational themes
Only return the hashtags, comma-separated, no numbering.`;

    let model;
    let result;

    try {
      model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
      result = await model.generateContent(prompt);
    } catch (error) {
      console.warn("Primary model failed, switching to fallback:", error.message);
      model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
      result = await model.generateContent(prompt);
    }

    const hashtags = result.response.text()
      .split(",")
      .map(tag => tag.trim().replace(/^#?/, "#")) // ensure starts with #
      .filter(Boolean);

    return NextResponse.json({ hashtags });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching trending hashtags" },
      { status: 500 }
    );
  }
}
