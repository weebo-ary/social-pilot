export async function GET() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { count, error } = await supabase
      .from("posts_after_time")
      .select("id", { count: "exact", head: true })
      .eq("status", "scheduled");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ scheduledCount: count });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDelayString(scheduleTime) {
  const now = Date.now();
  const target = new Date(scheduleTime).getTime();
  const ms = target - now;
  if (ms <= 0) return "0s";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export async function POST(req) {
  try {
  const { post, scheduleTime } = await req.json();

    if (!post || !scheduleTime) {
      return NextResponse.json(
        { error: "Post text and scheduleTime are required" },
        { status: 400 }
      );
    }

    // This is the endpoint QStash will call later
    const publishEndpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/linkedin-publish`;

    // Schedule with QStash
    // Insert scheduled post into Supabase with status 'scheduled' and get the id
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data, error: insertError } = await supabase
      .from("posts_after_time")
      .insert([{ post, schedule_time: scheduleTime, status: "scheduled" }])
      .select();
    if (insertError || !data || !data[0] || !data[0].id) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({
        error: "Failed to insert scheduled post",
        supabaseError: insertError
      }, { status: 500 });
    }
    const scheduledId = data[0].id;

    // Schedule with QStash, passing the id
    const res = await fetch(
      `${process.env.QSTASH_URL}/v2/publish/${publishEndpoint}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
          "Content-Type": "application/json",
          "Upstash-Delay": getDelayString(scheduleTime),
        },
        body: JSON.stringify({ post, id: scheduledId }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`QStash error: ${err}`);
    }

    return NextResponse.json({
      success: true,
      message: "Post scheduled successfully",
      id: scheduledId
    });
  } catch (error) {
    console.error("Schedule Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to schedule post" },
      { status: 500 }
    );
  }
}
