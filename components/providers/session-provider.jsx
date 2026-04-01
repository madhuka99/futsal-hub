"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/utils/supabase/client";
import { SessionManager } from "@/lib/session-manager";

export function SessionProvider({ children }) {
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    restoreSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await SessionManager.persistSession(session);
      } else if (event === "SIGNED_OUT") {
        await SessionManager.clearSession();
      } else if (event === "TOKEN_REFRESHED" && session) {
        await SessionManager.persistSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const restoreSession = async () => {
    try {
      // Check if already logged in
      const { data: { session } } = await supabaseBrowser.auth.getSession();

      if (!session) {
        // Try to restore from persistent storage
        const storedSession = await SessionManager.getSession();

        if (storedSession) {
          // Set the session in Supabase
          const { data, error } = await supabaseBrowser.auth.setSession({
            access_token: storedSession.access_token,
            refresh_token: storedSession.refresh_token,
          });

          if (error) {
            console.error("Error restoring session:", error);
            await SessionManager.clearSession();
          } else if (data.session) {
            // Session restored successfully
            await SessionManager.persistSession(data.session);
          }
        }
      } else {
        // Persist current session
        await SessionManager.persistSession(session);
      }
    } catch (error) {
      console.error("Error in session restoration:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  if (isRestoring) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
