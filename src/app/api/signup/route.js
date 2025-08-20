import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // must be service role key (not anon)
);

export async function POST(req) {
  try {
    const formData = await req.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const username = formData.get("username");
    const password = formData.get("password");
    const file = formData.get("profilePhoto");

    if (!name || !email || !username || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // ✅ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let photoUrl = null;
    if (file && file.name) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from("profile_photos")
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("profile_photos")
        .getPublicUrl(fileName);

      photoUrl = publicUrl.publicUrl;
    }

    // Save to users table
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          username,
          profile_photo: photoUrl,
          password: hashedPassword,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
