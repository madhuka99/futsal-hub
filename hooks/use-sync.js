"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseBrowser } from "@/utils/supabase/client";
import { offlineDB, STORES } from "@/lib/offline-db";
import { SyncQueue } from "@/lib/sync-queue";
import { useOffline } from "./use-offline";

export function useSync() {
  const { isOffline, wasOffline } = useOffline();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Sync data when coming back online
  useEffect(() => {
    if (!isOffline && wasOffline) {
      syncData();
    }
  }, [isOffline, wasOffline]);

  // Initialize IndexedDB
  useEffect(() => {
    offlineDB.init();
  }, []);

  const syncData = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Process any queued offline mutations first
      await SyncQueue.processQueue();

      // Fetch fresh data from Supabase
      await Promise.all([
        syncMatches(),
        syncPlayers(),
        syncImages(),
      ]);

      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncMatches = async () => {
    try {
      const { data: matches } = await supabaseBrowser
        .from("matches")
        .select(`
          *,
          created_by:profiles(full_name, email),
          match_players(*)
        `)
        .order("date", { ascending: true });

      if (matches) {
        await offlineDB.setMany(STORES.MATCHES, matches);
      }
    } catch (error) {
      console.error("Error syncing matches:", error);
    }
  };

  const syncPlayers = async () => {
    try {
      const { data: players } = await supabaseBrowser
        .from("player_statistics")
        .select("*");

      if (players) {
        await offlineDB.setMany(STORES.PLAYERS, players);
      }
    } catch (error) {
      console.error("Error syncing players:", error);
    }
  };

  const syncImages = async () => {
    try {
      const response = await fetch("/api/images");
      if (response.ok) {
        const { images } = await response.json();
        if (images) {
          await offlineDB.setMany(STORES.IMAGES, images);
        }
      }
    } catch (error) {
      console.error("Error syncing images:", error);
    }
  };

  return {
    isSyncing,
    lastSyncTime,
    syncData,
  };
}
