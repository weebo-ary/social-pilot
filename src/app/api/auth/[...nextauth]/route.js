import NextAuth from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
import { createClient } from "@supabase/supabase-js";

import fs from "fs";
import puppeteer from "puppeteer";

export const authOptions = {
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      issuer: "https://www.linkedin.com/oauth",
      wellKnown:
        "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      authorization: {
        params: {
          scope: "openid profile email w_member_social",
        },
      },
      profile(profile) {
        return {
          id: profile.sub, // LinkedIn person ID
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          linkedinId: profile.sub, // store separately for clarity
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user }) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { error } = await supabase.from("users").insert([
        {
          auth_id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.image,
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          console.log("ℹ User already exists, skipping insert.");
        } else {
          console.error("❌ Supabase insert error:", error);
          return false;
        }
      }

      return true;
    },

    // Save LinkedIn access_token to JWT
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.linkedinId = profile.sub;
      }
      return token;
    },

    // Add token data to session
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.linkedinId = token.linkedinId;
      return session;
    },
    
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
