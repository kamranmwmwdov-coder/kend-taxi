"use client";

import { useEffect, useRef } from "react";
import { notificationSound, type SoundEvent } from "@/utils/notification-sound";

const POLL_INTERVAL_MS = 15_000;

function eventForNotification(type: string): SoundEvent {
  switch (type) {
    case "DRIVER_ACCEPTED": return "DRIVER_ACCEPTED";
    case "CUSTOMER_SELECTED": return "CUSTOMER_SELECTED";
    case "DRIVER_CONFIRMED": return "DRIVER_CONFIRMED";
    case "ORDER_CANCELLED":
    case "DRIVER_CANCELLED": return "ORDER_CANCELLED";
    case "ORDER_COMPLETED": return "ORDER_COMPLETED";
    default: return "SYSTEM";
  }
}

/** Watches the existing in-app notifications without changing their API or storage. */
export function SoundNotificationProvider() {
  const initialized = useRef(false);
  const knownIds = useRef(new Set<string>());
  const unavailable = useRef(false);

  useEffect(() => {
    let active = true;
    const unlock = () => { void notificationSound.unlock(); };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    async function poll() {
      try {
        if (unavailable.current) return;
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (response.status === 401) {
          unavailable.current = true;
          return;
        }
        const json = await response.json();
        if (!active || !json.success || !Array.isArray(json.data?.items)) return;
        const items = json.data.items as Array<{ id: string; type: string }>;

        if (!initialized.current) {
          items.forEach((item) => knownIds.current.add(item.id));
          initialized.current = true;
          return;
        }

        for (const item of items) {
          if (knownIds.current.has(item.id)) continue;
          knownIds.current.add(item.id);
          void notificationSound.play(eventForNotification(item.type), `notification:${item.id}`);
        }
      } catch {
        // Existing visual notifications remain available if a poll fails.
      }
    }

    void poll();
    const interval = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return null;
}
