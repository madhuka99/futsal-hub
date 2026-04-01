// Custom service worker code — merged into the generated SW by @ducanh2912/next-pwa

// ========================
// Push Notification Handler
// ========================
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "FutsalHub", body: event.data.text() };
  }

  const { title = "FutsalHub", body, url, type, actions, matchId, userId } = data;

  const options = {
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: { url: url || "/dashboard", type, matchId, userId },
    tag: type || "default",
    renotify: true,
    vibrate: [200, 100, 200],
  };

  // Add action buttons for match_created/availability_request if user hasn't responded
  if ((type === "match_created" || type === "availability_request") && actions) {
    options.actions = [
      { action: "available", title: "Available" },
      { action: "not_available", title: "Not Available" },
    ];
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

// ========================
// Notification Click Handler
// ========================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { url, matchId, userId } = event.notification.data || {};
  const action = event.action;

  // Handle availability action buttons
  if (action && matchId && userId) {
    const status = action === "available" ? "available" : "not available";

    event.waitUntil(
      fetch("/api/push/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, userId, status }),
      }).catch((err) => console.error("Availability update failed:", err))
    );
    return;
  }

  // Default: open/focus the app at the notification URL
  const targetUrl = url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});

// ========================
// Background Sync Handler
// ========================
self.addEventListener("sync", (event) => {
  if (event.tag === "mutation-sync") {
    event.waitUntil(processSyncQueue());
  }
});

async function processSyncQueue() {
  let db;
  try {
    db = await openSyncDB();
  } catch {
    return;
  }

  const items = await idbGetAll(db, "sync_queue");
  const sorted = items.sort((a, b) => a.timestamp - b.timestamp);

  for (const item of sorted) {
    try {
      const response = await fetch("/api/push/sync-mutation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        await idbDelete(db, "sync_queue", item.id);
      }
    } catch (err) {
      // Will retry on next sync event
      console.error("Background sync failed for item:", item.id, err);
    }
  }
}

// ========================
// IndexedDB helpers for SW context
// ========================
function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("futsal_hub_offline", 2);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbGetAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbDelete(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
