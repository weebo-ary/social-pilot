"use client"

import { signIn } from "next-auth/react"

export default function SignInPage() {
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Welcome to Social Pilot</h1>
      <button onClick={() => signIn("linkedin", { callbackUrl: "/dashboard/linkedin" })}>
        Sign in with LinkedIn
      </button>
    </div>
  )
}
