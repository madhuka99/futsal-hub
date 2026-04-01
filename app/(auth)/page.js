// app/(auth)/page.js
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/utils/supabase/client";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import logo from "../../public/logo.png";

// Create a separate component for the auth logic that uses useSearchParams
function AuthContent() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  // Session check logic
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // If there's a redirect parameter, go there, otherwise go to dashboard
        const destination = redirectTo || "/dashboard";
        router.replace(destination);
      }
    });

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      if (session) {
        // If there's a redirect parameter, go there, otherwise go to dashboard
        const destination = redirectTo || "/dashboard";
        router.replace(destination);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, redirectTo]);

  // Google OAuth
  const handleGoogleSignIn = async () => {
    setLoading(true);

    // Build the redirect URL including the original destination
    let redirectUrl = `${window.location.origin}/`;
    if (redirectTo) {
      redirectUrl += `?redirect=${encodeURIComponent(redirectTo)}`;
    }

    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) console.error("OAuth error:", error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black">
      {/* Left side: Image & Features */}
      <div className="hidden md:block md:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black opacity-90"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 z-10">
          <Image
            src={logo}
            width={100}
            height={100}
            className="rounded-full my-5"
            alt="logo"
          />
          <h1 className="text-4xl font-bold mb-6 !text-white">FutsalHub</h1>
          <p className="text-xl max-w-md text-center mb-8 text-neutral-300">
            Organize matches, track stats, and manage your team with ease
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {/* Feature cards with glassmorphism */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 p-4 rounded-lg shadow-lg">
              <h3 className="font-semibold mb-1">Schedule Matches</h3>
              <p className="text-sm text-neutral-300">
                Create and manage upcoming games
              </p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 p-4 rounded-lg shadow-lg">
              <h3 className="font-semibold mb-1">Track Performance</h3>
              <p className="text-sm text-neutral-300">
                Monitor player stats and progress
              </p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 p-4 rounded-lg shadow-lg">
              <h3 className="font-semibold mb-1">Manage Teams</h3>
              <p className="text-sm text-neutral-300">
                Organize players and positions
              </p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 p-4 rounded-lg shadow-lg">
              <h3 className="font-semibold mb-1">Check Availability</h3>
              <p className="text-sm text-neutral-300">
                See who&apos;s available for games
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login with glassmorphism */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-br from-neutral-900 to-black">
        <div className="flex md:hidden flex-col items-center justify-center mb-6">
          <Image
            src={logo}
            width={100}
            height={100}
            className="rounded-full my-5"
            alt="logo"
          />
          <h1 className="text-4xl font-bold mb-6">FutsalHub</h1>
          <p className="text-xl max-w-md text-center mb-8 text-neutral-300">
            Organize matches, track stats, and manage your team with ease
          </p>
        </div>
        <div className="w-full max-w-md backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-2xl p-8">
          <div className="text-center">
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Welcome
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              {redirectTo
                ? "Sign in to continue to your destination"
                : "Sign in to access your dashboard"}
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3.5 border cursor-pointer border-white/20 rounded-lg shadow-sm text-base font-medium text-white bg-white/10 backdrop-blur-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition duration-200"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <FcGoogle className="h-5 w-5 mr-2" />
                )}
                {loading ? "Signing in..." : "Sign in with Google"}
              </button>
            </div>
          </div>

          <div className="mt-8 text-sm text-center text-neutral-400">
            <p>
              By signing in, you agree to our{" "}
              <a
                href="#"
                className="font-medium text-white hover:text-neutral-300 transition"
              >
                Terms
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="font-medium text-white hover:text-neutral-300 transition"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function AuthPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
        <p className="text-white">Loading...</p>
      </div>
    </div>
  );
}

// Main component that wraps AuthContent in Suspense
export default function HomePage() {
  return (
    <Suspense fallback={<AuthPageLoader />}>
      <AuthContent />
    </Suspense>
  );
}
