"use client";

import { useState, useEffect } from "react";

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Initialize online/offline state
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setWasOffline(isOffline);
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOffline]);

  return { isOffline, wasOffline };
}
