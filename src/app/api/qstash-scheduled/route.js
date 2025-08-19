import { NextResponse } from "next/server";


async function fetchQstashJobs() {
  const res = await fetch(`${process.env.QSTASH_URL}/v2/messages`, {
    headers: {
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    return { error: err, status: res.status };
  }
  const data = await res.json();
  console.log("QStash scheduled jobs:", JSON.stringify(data, null, 2));
  return { scheduled: data };
}

export async function GET() {
  try {
    const result = await fetchQstashJobs();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await fetchQstashJobs();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
