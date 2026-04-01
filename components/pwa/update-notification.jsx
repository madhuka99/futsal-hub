"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New service worker available
              setShowUpdate(true);
            }
          });
        });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "UPDATE_AVAILABLE") {
          setShowUpdate(true);
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Listen for controller change before sending skip waiting
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    } else {
      // Fallback: reload directly if no waiting worker
      window.location.reload();
    }
  };

  if (!showUpdate) return null;

  return (
    <Card className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-lg border-2 border-primary">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Update Available</h3>
            <p className="text-sm text-muted-foreground mb-3">
              A new version of FutsalHub is available. Refresh to update.
            </p>
            <Button onClick={handleUpdate} size="sm" className="w-full">
              Refresh Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
