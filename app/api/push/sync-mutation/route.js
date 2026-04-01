import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Tables that the sync queue is allowed to write to
const ALLOWED_TABLES = new Set([
  "matches",
  "match_players",
  "player_statistics",
  "profiles",
  "availability",
]);

const ALLOWED_OPERATIONS = new Set(["insert", "update", "upsert", "delete"]);

// Use service role — background sync from the service worker may not have
// valid session cookies (it can fire hours after the user closed the app).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { operation, table, payload } = await request.json();

    if (!operation || !table || !payload) {
      return NextResponse.json(
        { error: "Missing operation, table, or payload" },
        { status: 400 }
      );
    }

    if (!ALLOWED_OPERATIONS.has(operation)) {
      return NextResponse.json(
        { error: `Invalid operation: ${operation}` },
        { status: 400 }
      );
    }

    if (!ALLOWED_TABLES.has(table)) {
      return NextResponse.json(
        { error: `Table not allowed: ${table}` },
        { status: 403 }
      );
    }

    let result;

    switch (operation) {
      case "insert":
        result = await supabaseAdmin.from(table).insert(payload);
        break;
      case "update":
        result = await supabaseAdmin
          .from(table)
          .update(payload.data)
          .match(payload.match);
        break;
      case "upsert":
        result = await supabaseAdmin.from(table).upsert(payload);
        break;
      case "delete":
        result = await supabaseAdmin
          .from(table)
          .delete()
          .match(payload.match);
        break;
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
