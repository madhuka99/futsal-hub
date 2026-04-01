"use client";

import { useState, useEffect, useCallback } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushNotifications() {
  const [permission, setPermission] = useState("default");
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);

      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) return null;

    const perm = await Notification.requestPermission();
    setPermission(perm);

    if (perm !== "granted") return null;

    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      ),
    });

    // Extract keys and send to server
    const p256dh = btoa(
      String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")))
    );
    const auth = btoa(
      String.fromCharCode(...new Uint8Array(sub.getKey("auth")))
    );

    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        keys: { p256dh, auth },
      }),
    });

    if (response.ok) {
      setSubscription(sub);
    }

    return sub;
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    await fetch("/api/push/unsubscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    await subscription.unsubscribe();
    setSubscription(null);
  }, [subscription]);

  return { permission, subscription, isSupported, subscribe, unsubscribe };
}
