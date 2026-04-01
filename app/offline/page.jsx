"use client";

import React from "react";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-16 px-6">
          <div className="rounded-full bg-muted p-6 mb-6">
            <WifiOff className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-center">You're Offline</h1>
          <p className="text-muted-foreground text-center mb-6">
            It looks like you've lost your internet connection. Some features may not be available until you're back online.
          </p>
          <Button onClick={handleRetry} className="w-full">
            Try Again
          </Button>
          <p className="text-sm text-muted-foreground text-center mt-6">
            You can still view cached matches, players, and stats while offline.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
