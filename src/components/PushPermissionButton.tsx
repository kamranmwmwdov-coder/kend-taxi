"use client";

import { useEffect, useState } from "react";

type PushSubscriptionJson = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
};

function urlBase64ToUint8Array(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = window.atob(base64 + padding);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export function PushPermissionButton() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);

    if (Notification.permission !== "granted") return;

    void (async () => {
      // serviceWorker.ready waits for activation instead of possibly missing a not-yet-registered worker.
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await saveSubscription(subscription);
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    })().catch(() => {
      // Keep the permission control usable if an existing subscription cannot be synchronized.
    });
  }, []);

  async function saveSubscription(subscription: PushSubscription) {
    const payload = subscription.toJSON() as PushSubscriptionJson;
    const response = await fetch("/api/push/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!response.ok || !json.success) throw new Error(json.message ?? "Subscription could not be saved.");
  }

  async function enable() {
    setBusy(true);
    setMessage("");
    try {
      const registration = await navigator.serviceWorker.ready;
      const result = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") {
        setMessage("Phone notifications were not enabled.");
        return;
      }

      const keyResponse = await fetch("/api/push/vapid-public-key", { cache: "no-store" });
      const keyJson = await keyResponse.json();
      if (!keyResponse.ok || !keyJson.success || !keyJson.data?.publicKey) {
        throw new Error(keyJson.message ?? "Push configuration is not ready.");
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyJson.data.publicKey),
        });
      }
      await saveSubscription(subscription);
      setIsSubscribed(true);
      setMessage("Phone notifications are enabled.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Phone notifications could not be enabled.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage("");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const response = await fetch("/api/push/subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        if (!response.ok) throw new Error("Subscription could not be removed.");
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
      setMessage("Phone notifications are disabled.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Subscription could not be removed.");
    } finally {
      setBusy(false);
    }
  }

  if (permission === "unsupported") return null;

  return (
    <div className="mb-4 rounded-xl border border-gray-100 bg-white p-3">
      <p className="mb-2 text-sm font-medium">Telefon bildirişləri</p>
      <p className="mb-3 text-xs text-ink-muted">Vacib yenilikləri telefonunuzun ekranında görün.</p>
      {permission === "denied" ? (
        <p className="text-xs text-danger">Brauzer ayarlarından bildiriş icazəsini aktiv edin.</p>
      ) : (
        <button
          type="button"
          onClick={isSubscribed ? disable : enable}
          disabled={busy}
          className="min-h-[36px] rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Gözləyin..." : isSubscribed ? "Deaktiv et" : "Aktiv et"}
        </button>
      )}
      {message && <p className="mt-2 text-xs text-ink-muted">{message}</p>}
    </div>
  );
}
