"use client";

import { useEffect, useState } from "react";

export default function PushNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (!("serviceWorker" in navigator)) return;

    const current = Notification.permission;
    setPermission(current);
    if (localStorage.getItem("push_prompted")) setDismissed(true);

    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        if (current === "granted") {
          await subscribeToPush(registration);
        }
      })
      .catch((err) => console.warn("Service worker registration failed:", err));
  }, []);

  const requestPermission = async () => {
    setDismissed(true);
    localStorage.setItem("push_prompted", "1");
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        const registration = await navigator.serviceWorker.ready;
        await subscribeToPush(registration);
      }
    } catch {
      // Some mobile browsers don't support the promise API
      setPermission(Notification.permission);
    }
  };

  const subscribeToPush = async (registration: ServiceWorkerRegistration) => {
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        console.warn("VAPID public key missing");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys,
          userAgent: navigator.userAgent,
        }),
      });
      setSubscribed(true);
    } catch (err) {
      console.warn("Push subscription failed:", err);
    }
  };

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (dismissed) return null;

  if (permission === "default" || permission === "denied") {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-brand-green px-4 py-2 shadow-lg">
        <button
          onClick={requestPermission}
          className="text-sm font-medium text-white"
        >
          Enable notifications
        </button>
        <button
          onClick={() => { setDismissed(true); localStorage.setItem("push_prompted", "1"); }}
          className="text-white/70 hover:text-white"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    );
  }

  return null;
}
