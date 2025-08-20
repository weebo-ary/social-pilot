"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/signout", { method: "POST" });
    router.push("/"); // or "/"
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        marginTop: "1rem",
        marginLeft:"0.5rem",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
      className="flex items-center justify-center"
    >
      <LogOut />
    </button>
  );
}
