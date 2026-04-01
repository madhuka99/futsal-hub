"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationPrompt() {
  const { permission, subscription, isSupported, subscribe } =
    usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("notification_prompt_dismissed");
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    // Show prompt after a short delay if notifications are supported and not yet granted
    if (isSupported && permission === "default" && !subscription) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, subscription]);

  const handleEnable = async () => {
    await subscribe();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("notification_prompt_dismissed", "true");
    setShowPrompt(false);
  };

  if (
    dismissed ||
    !showPrompt ||
    !isSupported ||
    permission !== "default" ||
    subscription
  ) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-lg border-2">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Enable Notifications</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Get notified about new matches, team assignments, and score
              updates.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleEnable} size="sm" className="flex-1">
                Enable
              </Button>
              <Button onClick={handleDismiss} variant="outline" size="sm">
                Not Now
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
