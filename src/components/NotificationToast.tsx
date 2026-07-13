"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Car, CheckCircle2, PartyPopper, UserCheck, XCircle } from "lucide-react";
import { NOTIFICATION_ARRIVED_EVENT, type NotificationItem } from "@/components/SoundNotificationProvider";

const VISIBLE_LIMIT = 3;
const AUTO_DISMISS_MS = 5_000;
const DRAG_DISMISS_PX = 40;
const EXIT_DURATION_MS = 220;

type ToastPhase = "entering" | "visible" | "leaving";
type ToastEntry = { key: string; item: NotificationItem; phase: ToastPhase };

const TYPE_STYLE: Record<string, { icon: typeof Bell; badge: string; ring: string; bar: string }> = {
  ORDER_CREATED: { icon: Bell, badge: "bg-primary/10 text-primary", ring: "border-primary/15", bar: "bg-primary/50" },
  ORDER_OFFER: { icon: Bell, badge: "bg-primary/10 text-primary", ring: "border-primary/15", bar: "bg-primary/50" },
  DRIVER_ACCEPTED: { icon: Car, badge: "bg-primary/10 text-primary", ring: "border-primary/15", bar: "bg-primary/50" },
  CUSTOMER_SELECTED: { icon: UserCheck, badge: "bg-success/10 text-success", ring: "border-success/15", bar: "bg-success/50" },
  DRIVER_CONFIRMED: { icon: CheckCircle2, badge: "bg-success/10 text-success", ring: "border-success/15", bar: "bg-success/50" },
  ORDER_CANCELLED: { icon: XCircle, badge: "bg-danger/10 text-danger", ring: "border-danger/15", bar: "bg-danger/50" },
  DRIVER_CANCELLED: { icon: XCircle, badge: "bg-danger/10 text-danger", ring: "border-danger/15", bar: "bg-danger/50" },
  ORDER_COMPLETED: { icon: PartyPopper, badge: "bg-success/10 text-success", ring: "border-success/15", bar: "bg-success/50" },
  ORDER_STATUS_CHANGED: { icon: Bell, badge: "bg-warning/10 text-warning", ring: "border-warning/15", bar: "bg-warning/50" },
  SYSTEM: { icon: Bell, badge: "bg-ink/5 text-ink-muted", ring: "border-gray-100", bar: "bg-ink/20" },
};

function styleFor(type: string) {
  return TYPE_STYLE[type] ?? TYPE_STYLE.SYSTEM;
}

/**
 * Renders newly-arrived notifications as banners that drop down from the top of the
 * screen (like a native OS notification), on top of the existing bell/list/sound system.
 * Purely additive: it only listens to NOTIFICATION_ARRIVED_EVENT and never touches state.
 */
export function NotificationToast() {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timers = useRef(new Map<string, number>());
  const router = useRouter();
  const pathname = usePathname();

  const remove = useCallback((key: string) => {
    const timer = timers.current.get(key);
    if (timer !== undefined) window.clearTimeout(timer);
    timers.current.delete(key);
    setToasts((prev) => prev.filter((toast) => toast.key !== key));
  }, []);

  const startLeaving = useCallback(
    (key: string) => {
      const timer = timers.current.get(key);
      if (timer !== undefined) window.clearTimeout(timer);
      timers.current.delete(key);
      setToasts((prev) => prev.map((toast) => (toast.key === key ? { ...toast, phase: "leaving" } : toast)));
      window.setTimeout(() => remove(key), EXIT_DURATION_MS);
    },
    [remove]
  );

  useEffect(() => {
    function handleArrival(event: Event) {
      const item = (event as CustomEvent<NotificationItem>).detail;
      if (!item?.id) return;

      setToasts((prev) => {
        if (prev.some((toast) => toast.key === item.id)) return prev;
        return [{ key: item.id, item, phase: "entering" as ToastPhase }, ...prev].slice(0, VISIBLE_LIMIT);
      });

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(15);
        } catch {
          // Vibration is a nicety, never a requirement.
        }
      }

      // Two frames so the browser paints the "entering" (off-screen) position before
      // switching to "visible", which is what actually triggers the slide-down transition.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setToasts((prev) =>
            prev.map((toast) => (toast.key === item.id && toast.phase === "entering" ? { ...toast, phase: "visible" } : toast))
          );
        });
      });

      const timer = window.setTimeout(() => startLeaving(item.id), AUTO_DISMISS_MS);
      timers.current.set(item.id, timer);
    }

    window.addEventListener(NOTIFICATION_ARRIVED_EVENT, handleArrival);
    return () => window.removeEventListener(NOTIFICATION_ARRIVED_EVENT, handleArrival);
  }, [startLeaving]);

  useEffect(() => {
    const timerMap = timers.current;
    return () => {
      timerMap.forEach((id) => window.clearTimeout(id));
      timerMap.clear();
    };
  }, []);

  const handleTap = useCallback(
    (entry: ToastEntry) => {
      startLeaving(entry.key);
      fetch("/api/notifications/read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: entry.item.id }),
      }).catch(() => undefined);

      const target = pathname?.startsWith("/driver")
        ? "/driver/notifications"
        : pathname?.startsWith("/customer")
        ? "/customer/notifications"
        : null;
      if (target) router.push(target);
    },
    [pathname, router, startLeaving]
  );

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[200] flex flex-col gap-2 px-3 pointer-events-none"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
      aria-live="polite"
    >
      {toasts.map((entry) => (
        <ToastCard key={entry.key} entry={entry} onDismiss={() => startLeaving(entry.key)} onTap={() => handleTap(entry)} />
      ))}
    </div>
  );
}

function ToastCard({ entry, onDismiss, onTap }: { entry: ToastEntry; onDismiss: () => void; onTap: () => void }) {
  const { icon: Icon, badge, ring, bar } = styleFor(entry.item.type);
  const [dragY, setDragY] = useState(0);
  const dragging = useRef(false);
  const moved = useRef(false);
  const startY = useRef(0);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    moved.current = false;
    startY.current = event.clientY;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const delta = event.clientY - startY.current;
    if (Math.abs(delta) > 4) moved.current = true;
    // Only allow dragging upward, off the top of the screen.
    setDragY(Math.min(0, delta));
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (dragY < -DRAG_DISMISS_PX) {
      onDismiss();
      return;
    }
    setDragY(0);
    if (!moved.current) onTap();
  };

  const isDragging = dragging.current;
  const translate =
    entry.phase === "entering"
      ? "-translate-y-[150%] opacity-0"
      : entry.phase === "leaving"
      ? "-translate-y-[150%] opacity-0"
      : "translate-y-0 opacity-100";
  const easing =
    entry.phase === "leaving" ? "duration-200 ease-in" : "duration-[420ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]";

  return (
    <div
      className={`pointer-events-auto select-none rounded-2xl bg-white border ${ring} shadow-lg shadow-black/10 overflow-hidden transition-all ${!isDragging ? easing : ""} ${translate}`}
      style={dragY ? { transform: `translateY(${dragY}px)`, transition: "none" } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="alert"
    >
      <div className="flex gap-3 p-4">
        <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${badge}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-ink truncate">{entry.item.title}</p>
          <p className="text-sm text-ink-muted line-clamp-2">{entry.item.message}</p>
        </div>
      </div>
      {entry.phase === "visible" && (
        <div className="h-0.5 bg-gray-100">
          <div className={`h-full ${bar} animate-[kt-toast-shrink_5000ms_linear_forwards]`} />
        </div>
      )}
    </div>
  );
}
