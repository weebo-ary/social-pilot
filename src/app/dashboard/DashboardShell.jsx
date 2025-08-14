"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Instagram,
  Linkedin,
  LogOut,
  Menu,
  TwitterIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import SPLogo from "@/assets/images/social-pilot-dark.jpg";

export default function DashboardShell({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (route) =>
    pathname === route || pathname.startsWith(`${route}/`);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return redirect("/");

  return (
    <div className="flex h-screen">
      <aside
        className={`bg-black text-white flex flex-col p-4 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } flex-shrink-0`}
      >
        <div
          className={`${
            collapsed
              ? "flex flex-col items-center justify-center"
              : "flex items-center justify-between mb-4"
          }`}
        >
          <Image
            src={SPLogo}
            alt="Social Pilot Logo"
            className={`${collapsed ? "w-full" : "w-1/3"}`}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-white cursor-pointer mb-4 mt-2"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </Button>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-3 mb-6">
            <div>
              <p className="font-semibold">{session.user.name}</p>
              <p className="text-sm text-gray-400">{session.user.email}</p>
            </div>
          </div>
        )}

        <nav className="flex-1">
          <Link href="/dashboard/linkedin" className="w-full">
            <Button
              variant={isActive("/dashboard/linkedin") ? "default" : "ghost"}
              className={`w-full justify-start items-center cursor-pointer mb-4 ${
                isActive("/dashboard/linkedin")
                  ? "bg-secondary text-secondary-foreground hover:text-white hover:bg-primary"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Linkedin className="-ml-1" />
              {!collapsed && "Kabir (Linkedin Expert)"}
            </Button>
          </Link>

          <Link href="/dashboard/instagram" className="w-full">
            <Button
              variant={isActive("/dashboard/instagram") ? "default" : "ghost"}
              className={`w-full justify-start items-center cursor-pointer mb-4 ${
                isActive("/dashboard/instagram")
                  ? "bg-secondary text-secondary-foreground hover:text-white hover:bg-primary"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Instagram className="-ml-1" />
              {!collapsed && "Rahul (Instagram Expert)"}
            </Button>
          </Link>

          <Link href="/dashboard/x" className="w-full">
            <Button
              variant={isActive("/dashboard/x") ? "default" : "ghost"}
              className={`w-full justify-start items-center cursor-pointer mb-4 ${
                isActive("/dashboard/x")
                  ? "bg-secondary text-secondary-foreground hover:text-white hover:bg-primary"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <TwitterIcon className="-ml-1" />
              {!collapsed && "Vamika (X Expert)"}
            </Button>
          </Link>
        </nav>

        <Button
          variant="destructive"
          onClick={() => signOut()}
          className="mt-auto cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Logout"}
        </Button>
      </aside>

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">{children}</main>
    </div>
  );
}
