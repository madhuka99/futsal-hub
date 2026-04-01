"use client";

import { WifiOff, Wifi } from "lucide-react";
import { useOffline } from "@/hooks/use-offline";
import { useSync } from "@/hooks/use-sync";
import { Badge } from "@/components/ui/badge";

export function OfflineIndicator() {
  const { isOffline } = useOffline();
  const { isSyncing } = useSync();

  if (!isOffline && !isSyncing) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Badge
        variant={isOffline ? "destructive" : "default"}
        className="px-4 py-2 text-sm font-medium shadow-lg"
      >
        {isOffline ? (
          <>
            <WifiOff className="h-4 w-4 mr-2" />
            You're Offline
          </>
        ) : isSyncing ? (
          <>
            <Wifi className="h-4 w-4 mr-2 animate-pulse" />
            Syncing...
          </>
        ) : null}
      </Badge>
    </div>
  );
}
