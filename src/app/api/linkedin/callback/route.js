import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "No code returned" }, { status: 400 });
  }

  try {
    // Exchange authorization code for access token
    const resp = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI,
        client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });

    const tokenData = await resp.json();

    if (!resp.ok) {
      console.error("Token exchange failed:", tokenData);
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 500 }
      );
    }

    // Redirect to dashboard/linkedin instead of dashboard
    const res = NextResponse.redirect("http://localhost:3000/dashboard/linkedin");

    res.cookies.set("linkedin_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: tokenData.expires_in,
    });

    return res;
  } catch (err) {
    console.error("LinkedIn Callback Error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
