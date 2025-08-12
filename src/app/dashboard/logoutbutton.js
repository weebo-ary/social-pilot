"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() =>
        signOut({ redirect: true, callbackUrl: "/" }) // redirect immediately, no JSON parsing
      }
      style={{
        marginTop: "1rem",
        padding: "0.5rem 1rem",
        background: "red",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  );
}
