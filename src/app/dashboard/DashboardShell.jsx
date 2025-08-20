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
import { useEffect } from "react";
import LogoutButton from "./logoutbutton";

export default function DashboardShell({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (route) =>
    pathname === route || pathname.startsWith(`${route}/`);

  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/me");
      const data = await res.json();
      setUser(data);
    }
    fetchUser();
  }, []);

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
        {collapsed ? (
          <>
            <div className="flex flex-colrounded-lg items-center  justify-between mb-4">
              <img
                src={user?.user.profile_photo || ""}
                alt="Profile"
                className="w-full rounded-full mr-2"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col bg-white rounded-lg p-2 items-center  justify-between mb-4">
              <img
                src={user?.user.profile_photo || ""}
                alt="Profile"
                className="w-1/4 rounded-full mr-2"
              />
              <div className="flex flex-col items-center justify-center">
                <h2 className="capitalize text-black text-lg text-whie">
                  {user?.user.name}
                </h2>
                <h2 className="text-xs text-gray-700">{user?.user.email}</h2>
              </div>
            </div>
          </>
        )}
        <LogoutButton />
        {/* <Button
          variant="destructive"
          onClick={() =>
            signOut({
              callbackUrl: "/",
              redirect: true,
            })
          }
          className="mt-auto cursor-pointer"
        >
        
          {!collapsed && "Logout"}
        </Button> */}
      </aside>

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">{children}</main>
    </div>
  );
}
