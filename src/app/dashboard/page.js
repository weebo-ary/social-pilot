"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import LinkedinComp from "@/components/linkedin";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = pathname === "/dashboard";

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return redirect("/");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-black text-white flex flex-col p-4 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Collapse toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white cursor-pointer"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5"/>}
          </Button>
        </div>

        {/* User info */}
        {!collapsed && (
          <div className="flex items-center gap-3 mb-6">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-semibold">{session.user.name}</p>
              <p className="text-sm text-gray-400">{session.user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1">
          <Link href="/dashboard" className="w-full">
            <Button
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start items-center ${
                isActive
                  ? "bg-secondary text-secondary-foreground cursor-pointer ease-in-out duration-500 hover:text-white hover:bg-primary"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <LayoutDashboard className="-ml-1" />
              {!collapsed && "Dashboard"}
            </Button>
          </Link>
        </nav>

        {/* Logout */}
        <Button
          variant="destructive"
          onClick={() => signOut()}
          className="mt-auto cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Logout"}
        </Button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 space-y-6">
        {/* Analyze Post Section */}
        <LinkedinComp />
      </main>
    </div>
  );
}
