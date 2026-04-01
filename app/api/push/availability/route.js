import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { matchId, userId, status } = await request.json();

    if (!matchId || !userId || !status) {
      return NextResponse.json(
        { error: "Missing matchId, userId, or status" },
        { status: 400 }
      );
    }

    const validStatuses = ["available", "not available", "maybe"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Check if user already has an availability record
    const { data: existing } = await supabaseAdmin
      .from("availability")
      .select("id")
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabaseAdmin
        .from("availability")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", existing.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Create new record
      const { error } = await supabaseAdmin
        .from("availability")
        .insert([{ match_id: matchId, user_id: userId, status }]);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
