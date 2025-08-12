import NextAuth from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
import { createClient } from "@supabase/supabase-js";

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
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.image,
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

      // Try inserting — ignore duplicate key errors
      const { error } = await supabase.from("users").insert([
        {
          auth_id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.image,
        },
      ]);

      if (error) {
        // Ignore duplicate key errors
        if (error.code === "23505") {
          console.log("ℹ User already exists, skipping insert.");
        } else {
          console.error("❌ Supabase insert error:", error);
          return false;
        }
      }

      return true;
    },

    async session({ session }) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      if (session?.user?.email) {
        const { data } = await supabase
          .from("users")
          .select("auth_id, name, email, avatar_url")
          .eq("email", session.user.email)
          .single();

        if (data) {
          session.user.auth_id = data.auth_id;
          session.user.name = data.name;
          session.user.avatar_url = data.avatar_url;
        }
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
