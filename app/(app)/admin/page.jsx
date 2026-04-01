// app/(app)/admin/page.jsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotificationToAll } from "@/lib/push-notifications";
import { NotificationSender } from "@/components/admin/notification-sender";
import "server-only";

export default async function AdminPage() {
  // 1. Grab the session
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  // 2. If no session, bounce to login
  if (!session?.user) {
    redirect("/");
  }

  const user = session.user;

  // 3. Fetch or create profile row
  let { data: profile } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    await supabaseServer.from("profiles").insert({
      id: user.id,
      email: user.email,
    });
    profile = { role: "user" };

    // Notify admins about new player
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data: adminProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("role", "admin");

      if (adminProfiles?.length) {
        const adminIds = adminProfiles.map((p) => p.id);
        const { data: subscriptions } = await supabaseAdmin
          .from("push_subscriptions")
          .select("*")
          .in("user_id", adminIds);

        if (subscriptions?.length) {
          const payload = JSON.stringify({
            type: "new_player",
            title: "New Player Joined",
            body: `${user.email} joined FutsalHub`,
            url: "/players",
          });
          await sendNotificationToAll(subscriptions, payload);
        }
      }
    } catch (err) {
      console.error("Failed to send new player notification:", err);
    }
  }

  // 4. Only allow specific admin email
  if (user.email !== "yhmpth@gmail.com") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage notifications and app settings
        </p>
      </div>
      <NotificationSender />
    </div>
  );
}
