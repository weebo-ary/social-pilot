import React from "react";
import SignInPage from "@/app/api/auth//signin/page";

/**
 * v0 by Vercel.
 * @see https://v0.app/t/1ztOjIUO9hp
 * Documentation: https://v0.app/docs#integrating-generated-code-into-your-nextjs-app
 */
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Login() {
  return (
    <div className="w-full">
      <div className="w-full">
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Please Login through you Linkedin Account.
            </CardDescription>
          </CardHeader>
          <SignInPage />
        </Card>
      </div>
    </div>
  );
}

function page() {
  return (
    <div className="flex items-center justify-center mt-20">
      {" "}
      <Login />
    </div>
  );
}

export default page;
