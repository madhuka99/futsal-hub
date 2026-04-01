"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isIOS, isStandalone } from "@/lib/ios-detection";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    const isDismissed = sessionStorage.getItem("install_prompt_dismissed");
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    // Handle Android install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Hide prompt after successful installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowIOSPrompt(false);
      setDismissed(true);
      sessionStorage.setItem("install_prompt_dismissed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Handle iOS detection
    if (isIOS() && !isStandalone()) {
      // Show iOS install instructions after 30 seconds
      const timer = setTimeout(() => {
        setShowIOSPrompt(true);
      }, 30000);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("install_prompt_dismissed", "true");
    setShowIOSPrompt(false);
  };

  if (dismissed || isStandalone()) return null;

  // Android Install Prompt
  if (deferredPrompt) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Install FutsalHub</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Install our app for a better experience with offline access and quick launch.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleInstallClick} size="sm" className="flex-1">
                  Install
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

  // iOS Install Instructions
  if (showIOSPrompt) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Install FutsalHub</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                To install this app on your iPhone/iPad:
              </p>
              <ol className="text-sm text-muted-foreground space-y-2 mb-4 list-decimal list-inside">
                <li>Tap the Share button in Safari</li>
                <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                <li>Tap &quot;Add&quot; in the top right corner</li>
              </ol>
              <Button onClick={handleDismiss} variant="outline" size="sm" className="w-full">
                Got it
              </Button>
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

  return null;
}
