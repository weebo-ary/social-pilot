import { NextResponse } from "next/server";
import fetch from "node-fetch";

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_PROFILE_URN = process.env.LINKEDIN_PROFILE_URN;

export async function POST(req) {
  try {
    const { post } = await req.json();
    if (!post) {
      return NextResponse.json({ error: "Post text is required" }, { status: 400 });
    }

    const linkedInPost = {
      author: LINKEDIN_PROFILE_URN,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: post },
          shareMediaCategory: "NONE"
        }
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
    };

    const linkedinRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify(linkedInPost)
    });

    if (!linkedinRes.ok) {
      const err = await linkedinRes.text();
      throw new Error(`LinkedIn API Error: ${err}`);
    }

    return NextResponse.json({ success: true, postedToLinkedIn: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Error posting to LinkedIn" }, { status: 500 });
  }
}
