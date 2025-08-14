import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const PRIMARY_MODEL = "gemini-1.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

export async function POST(req) {
  try {
    const { postType, tone, title, content, wordRange, emoji } = await req.json();
    if (!postType || !tone || !title || !content) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    let prompt = `Create a LinkedIn ${postType} post with a ${tone} tone titled "${title}". Content: "${content}". 
    Use around ${wordRange} words. ${emoji ? "Include emojis." : "No emojis."} Add relevant trending hashtags.`;

    let model;
    try {
      // First try primary model
      model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
      var result = await model.generateContent(prompt);
    } catch (error) {
      console.warn("Primary model failed, switching to fallback:", error.message);
      // Use fallback model
      model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
      var result = await model.generateContent(prompt);
    }

    const response = await result.response.text();
    return NextResponse.json({ post: response });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating post" }, { status: 500 });
  }
}
