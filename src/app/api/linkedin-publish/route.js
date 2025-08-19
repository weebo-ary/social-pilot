// app/api/linkedin/publish/route.js
import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_PROFILE_URN = process.env.LINKEDIN_PROFILE_URN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req) {
  try {
    const { post, id } = await req.json();
    if (!post || !id) {
      return NextResponse.json({ error: "Post text and id are required" }, { status: 400 });
    }

    // Check if the post still exists and is scheduled
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: scheduled, error } = await supabase
      .from("posts_after_time")
      .select("*")
      .eq("id", id)
      .eq("status", "scheduled")
      .single();

    if (error || !scheduled) {
      return NextResponse.json({ error: "Scheduled post not found or already processed" }, { status: 404 });
    }


    // Generate a random id (UUID v4 style)
    const randomId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);

    const linkedInPost = {
      id: randomId,
      author: LINKEDIN_PROFILE_URN,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: post, id: id },
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
      // Mark as failed
      await supabase.from("posts_after_time").update({ status: "failed" }).eq("id", id);
      throw new Error(`LinkedIn API Error: ${err}`);
    }

    // Mark as posted
    await supabase.from("posts_after_time").update({ status: "posted" }).eq("id", id);

    return NextResponse.json({ success: true, postedToLinkedIn: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Error posting to LinkedIn" }, { status: 500 });
  }
}