"use client";

import { Linkedin } from "lucide-react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2 className="text-4xl mb-10">Welcome to Social Pilot</h2>
      <div className="px-6">
        <button
          className="cursor-pointer flex items-center gap-2 w-full justify-center bg-white p-2 text-black rounded"
          onClick={() =>
            signIn("linkedin", { callbackUrl: "/dashboard/linkedin" })
          }
        >
          Sign in with <Linkedin />
        </button>
      </div>
    </div>
  );
}
