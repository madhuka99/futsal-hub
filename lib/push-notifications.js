import webpush from "web-push";

let initialized = false;

function initVapid() {
  if (initialized) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  initialized = true;
}

export async function sendNotification(subscription, payload) {
  initVapid();

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  try {
    await webpush.sendNotification(pushSubscription, payload);
    return { subscription, error: null };
  } catch (error) {
    return { subscription, error };
  }
}

export async function sendNotificationToAll(subscriptions, payload) {
  return Promise.all(
    subscriptions.map((sub) => sendNotification(sub, payload))
  );
}
