"use client";

import { useEffect, useRef, useState } from "react";
import { notificationSound, type SoundEvent } from "@/utils/notification-sound";

const FOREGROUND_POLL_INTERVAL_MS = 5_000;
const BACKGROUND_POLL_INTERVAL_MS = 30_000;
const STATE_EVENT = "kt-notifications-state-change";
export const NOTIFICATION_ARRIVED_EVENT = "notification-arrived";

export type NotificationItem = { id: string; type: string; is_read: boolean; created_at: string; title: string; message: string };
type NotificationState = { items: NotificationItem[]; unreadCount: number; loading: boolean };

let sharedState: NotificationState = { items: [], unreadCount: 0, loading: true };
let sharedRefresh: () => Promise<void> = async () => undefined;

function publish(state: NotificationState) {
  sharedState = state;
  window.dispatchEvent(new Event(STATE_EVENT));
}

/** Shared client snapshot populated exclusively by SoundNotificationProvider. */
export function useSharedNotifications() {
  const [state, setState] = useState<NotificationState>(sharedState);

  useEffect(() => {
    const update = () => setState(sharedState);
    window.addEventListener(STATE_EVENT, update);
    update();
    return () => window.removeEventListener(STATE_EVENT, update);
  }, []);

  return { ...state, refresh: () => sharedRefresh() };
}

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
  const initializedAt = useRef(Date.now());
  const knownIds = useRef(new Set<string>());
  const inFlight = useRef(false);
  const refreshQueued = useRef(false);

  useEffect(() => {
    let active = true;
    const unlock = () => { void notificationSound.unlock(); };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    async function poll() {
      if (inFlight.current) {
        refreshQueued.current = true;
        return;
      }
      inFlight.current = true;
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (response.status === 401) {
          publish({ items: [], unreadCount: 0, loading: false });
          knownIds.current.clear();
          initialized.current = false;
          initializedAt.current = Date.now();
          return;
        }
        const json = await response.json();
        if (!active || !json.success || !Array.isArray(json.data?.items)) return;
        const items = json.data.items as NotificationItem[];
        publish({ items, unreadCount: json.data.unreadCount ?? 0, loading: false });

        if (!initialized.current) {
          const startedAt = initializedAt.current;
          items.forEach((item) => {
            knownIds.current.add(item.id);
            // Avoid replaying history while still alerting for rows created during
            // this provider's initial request.
            if (new Date(item.created_at).getTime() >= startedAt) {
              void notificationSound.play(eventForNotification(item.type), `notification:${item.id}`);
            }
          });
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
      } finally {
        inFlight.current = false;
        if (active && refreshQueued.current) {
          refreshQueued.current = false;
          void poll();
        }
      }
    }

    sharedRefresh = poll;
    void poll();
    let timer: number | undefined;
    const scheduleNextPoll = () => {
      timer = window.setTimeout(() => {
        void poll();
        scheduleNextPoll();
      }, document.visibilityState === "visible" ? FOREGROUND_POLL_INTERVAL_MS : BACKGROUND_POLL_INTERVAL_MS);
    };
    scheduleNextPoll();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      sharedRefresh = async () => undefined;
    };
  }, []);

  return null;
}
