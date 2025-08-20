import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Clear the session cookie
    const res = NextResponse.json({ message: "Signed out successfully" });
    res.cookies.set("session_user", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, // instantly expire
    });

    return res;
  } catch (error) {
    console.error("Signout Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
