// app/api/images/route.js
import { del } from "@vercel/blob";
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

// GET - Fetch all images with uploader information
export async function GET(request) {
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

    // Fetch all images with uploader information using a join with profiles
    const { data: images, error } = await supabase
      .from("images")
      .select(
        `
        id,
        filename,
        url,
        size,
        type,
        created_at,
        user_id,
        profiles!inner(
          id,
          email,
          full_name,
          avatar_url
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch images" },
        { status: 500 }
      );
    }

    // Format the response with uploader information
    const formattedImages = images.map((image) => ({
      id: image.id,
      filename: image.filename,
      url: image.url,
      size: image.size,
      type: image.type,
      uploadedAt: image.created_at,
      userId: image.user_id,
      uploaderName:
        image.profiles?.full_name || image.profiles?.email || "Unknown User",
      uploaderEmail: image.profiles?.email,
      uploaderAvatar: image.profiles?.avatar_url || "",
    }));

    return NextResponse.json({ images: formattedImages });
  } catch (error) {
    console.error("Fetch images error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an image (only by owner)
export async function DELETE(request) {
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

    const { imageId, imageUrl } = await request.json();

    if (!imageId || !imageUrl) {
      return NextResponse.json(
        { error: "Image ID and URL are required" },
        { status: 400 }
      );
    }

    // First, get the image data to ensure user owns it and get the stored filename
    const { data: imageData, error: fetchError } = await supabase
      .from("images")
      .select("stored_filename, user_id")
      .eq("id", imageId)
      .single();

    if (fetchError || !imageData) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Check if user owns the image
    if (imageData.user_id !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own images" },
        { status: 403 }
      );
    }

    // Delete from Vercel Blob
    try {
      await del(imageUrl, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } catch (blobError) {
      console.error("Blob deletion error:", blobError);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("images")
      .delete()
      .eq("id", imageId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
