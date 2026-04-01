// utils/supabase/server.js
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const supabaseServer = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    cookies: {
      // must be async and await cookies() first
      async getAll() {
        const store = await cookies();
        return store.getAll();
      },
      async setAll(cookiesToSet) {
        const store = await cookies();
        cookiesToSet.forEach(({ name, value, options }) => {
          store.set(name, value, options);
        });
      },
    },
  }
);
