// middleware.js
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request) {
  // Get response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Check if session exists
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the pathname from the request
  const { pathname } = request.nextUrl;

  // Define auth pages (ones that don't need protection)
  const isAuthRoute =
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.includes("/api/");

  // If no session and trying to access protected route, redirect to login with redirect param
  if (!session && !isAuthRoute) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If session exists and trying to access login page, check for redirect param
  if (session && pathname === "/") {
    const redirectTo = request.nextUrl.searchParams.get("redirect");
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
