import { offlineDB, STORES } from "./offline-db";

export const SyncQueue = {
  async addToQueue(mutation) {
    const item = {
      id: crypto.randomUUID(),
      ...mutation,
      timestamp: Date.now(),
      status: "pending",
    };
    await offlineDB.set(STORES.SYNC_QUEUE, item);

    // Request background sync if available
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register("mutation-sync");
      } catch (err) {
        console.warn("Background sync registration failed:", err);
      }
    }

    return item;
  },

  async getQueue() {
    const items = await offlineDB.getAll(STORES.SYNC_QUEUE);
    return items.sort((a, b) => a.timestamp - b.timestamp);
  },

  async removeFromQueue(id) {
    return offlineDB.delete(STORES.SYNC_QUEUE, id);
  },

  async getQueueCount() {
    const items = await offlineDB.getAll(STORES.SYNC_QUEUE);
    return items.length;
  },

  async processQueue() {
    const items = await this.getQueue();
    if (!items.length) return;

    const { supabaseBrowser } = await import("@/utils/supabase/client");

    for (const item of items) {
      try {
        let result;
        switch (item.operation) {
          case "insert":
            result = await supabaseBrowser.from(item.table).insert(item.payload);
            break;
          case "update":
            result = await supabaseBrowser
              .from(item.table)
              .update(item.payload.data)
              .match(item.payload.match);
            break;
          case "upsert":
            result = await supabaseBrowser.from(item.table).upsert(item.payload);
            break;
          case "delete":
            result = await supabaseBrowser
              .from(item.table)
              .delete()
              .match(item.payload.match);
            break;
        }

        if (result?.error) {
          console.error(`Sync queue item ${item.id} failed:`, result.error);
          continue;
        }

        await this.removeFromQueue(item.id);
      } catch (error) {
        console.error(`Failed to process queued mutation ${item.id}:`, error);
      }
    }
  },
};
