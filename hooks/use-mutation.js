"use client";

import { useCallback } from "react";
import { supabaseBrowser } from "@/utils/supabase/client";
import { useOffline } from "./use-offline";
import { SyncQueue } from "@/lib/sync-queue";

export function useMutation() {
  const { isOffline } = useOffline();

  const mutate = useCallback(
    async ({ table, operation, payload, onSuccess, onError }) => {
      if (isOffline) {
        try {
          const item = await SyncQueue.addToQueue({ table, operation, payload });
          return { queued: true, data: payload, queueId: item.id };
        } catch (err) {
          onError?.(err);
          throw err;
        }
      }

      try {
        let result;
        switch (operation) {
          case "insert":
            result = await supabaseBrowser.from(table).insert(payload).select();
            break;
          case "update":
            result = await supabaseBrowser
              .from(table)
              .update(payload.data)
              .match(payload.match)
              .select();
            break;
          case "upsert":
            result = await supabaseBrowser.from(table).upsert(payload).select();
            break;
          case "delete":
            result = await supabaseBrowser
              .from(table)
              .delete()
              .match(payload.match);
            break;
        }

        if (result?.error) throw result.error;
        onSuccess?.(result?.data);
        return { queued: false, data: result?.data };
      } catch (err) {
        onError?.(err);
        throw err;
      }
    },
    [isOffline]
  );

  return { mutate, isOffline };
}
