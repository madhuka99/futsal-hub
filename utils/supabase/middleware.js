// utils/supabase/middleware.js
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  // Start with a NextResponse so we can attach refreshed cookies to it
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // read all incoming cookies from the request
        getAll() {
          return request.cookies.getAll();
        },
        // mirror any Set-Cookie headers into our NextResponse
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // this will refresh tokens if needed, invoking our setAll above
  await supabase.auth.getSession();

  return supabaseResponse;
}
