// app/api/upload/route.js
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Helper function to create Supabase client for each request
async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

export async function POST(request) {
  try {
    const supabase = await createSupabaseServer();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const filename = `${timestamp}-${randomId}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Save metadata to Supabase
    const { data: imageData, error: dbError } = await supabase
      .from("images")
      .insert({
        filename: file.name,
        stored_filename: filename,
        url: blob.url,
        size: file.size,
        type: file.type,
        user_id: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save image metadata" },
        { status: 500 }
      );
    }

    // Get user profile information for the response
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, avatar_url")
      .eq("id", user.id)
      .single();

    // Return formatted response with uploader information
    return NextResponse.json({
      id: imageData.id,
      filename: imageData.filename,
      url: imageData.url,
      size: imageData.size,
      type: imageData.type,
      uploadedAt: imageData.created_at,
      userId: imageData.user_id,
      uploaderName:
        profile?.full_name || profile?.email || user.email || "Unknown User",
      uploaderEmail: profile?.email || user.email,
      uploaderAvatar:
        profile?.avatar_url || user.user_metadata?.avatar_url || "",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
