import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification, sendNotificationToAll } from "@/lib/push-notifications";

// Use service role to read all subscriptions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { type, title, body, url, excludeUserId, userIds, matchId } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "Missing title or body" },
        { status: 400 }
      );
    }

    // Fetch subscriptions based on targeting
    let query = supabaseAdmin.from("push_subscriptions").select("*");
    if (userIds?.length) {
      // Send to specific users only
      query = query.in("user_id", userIds);
    } else if (excludeUserId) {
      query = query.neq("user_id", excludeUserId);
    }
    const { data: subscriptions, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!subscriptions?.length) {
      return NextResponse.json({ sent: 0 });
    }

    // For match_created and availability_request, send per-user payloads
    // with action buttons so all players can respond.
    let results;
    const needsActions = type === "match_created" || type === "availability_request";
    const resolvedMatchId = matchId || (url ? url.split("/matches/")[1] : null);

    if (needsActions && resolvedMatchId) {
      results = await Promise.all(
        subscriptions.map((sub) => {
          const userPayload = JSON.stringify({
            type,
            title,
            body,
            url,
            matchId: resolvedMatchId,
            userId: sub.user_id,
            actions: true,
          });
          return sendNotification(sub, userPayload);
        })
      );
    } else {
      const payload = JSON.stringify({ type, title, body, url });
      results = await sendNotificationToAll(subscriptions, payload);
    }

    // Clean up stale subscriptions (410 Gone = endpoint no longer valid)
    const staleCleanups = results
      .filter((r) => r.error?.statusCode === 410)
      .map((r) =>
        supabaseAdmin
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", r.subscription.endpoint)
      );

    if (staleCleanups.length) {
      await Promise.all(staleCleanups);
    }

    const sent = results.filter((r) => !r.error).length;
    return NextResponse.json({ sent });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
