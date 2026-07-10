"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ORDER_TYPE_LABEL } from "@/components/StatusBadge";
import { LogoutButton } from "@/components/LogoutButton";
import { Countdown } from "@/components/Countdown";
import { NotificationBell } from "@/components/NotificationBell";
import { SoundToggle } from "@/components/SoundToggle";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { notificationSound } from "@/utils/notification-sound";

const SERVICE_LABELS: Record<string, string> = {
  BAKU_MORNING: "Bakı Səhər",
  BAKU_NOON: "Bakı Günorta",
  BAKU_EVENING: "Bakı Axşam",
  LOCAL: "Rayon Daxili",
  CARGO: "El Yükü",
};

interface ServiceRow {
  service_type: string;
  enabled: boolean;
}

export function DriverDashboard({ firstName }: { firstName: string }) {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [confirmTimeoutSec, setConfirmTimeoutSec] = useState(120);
  const [loading, setLoading] = useState(true);
  const knownOfferIds = useRef(new Set<string>());
  const knownActiveStates = useRef(new Map<string, string>());
  const hasLoadedSounds = useRef(false);
  const refreshInFlight = useRef(false);
  const refreshQueued = useRef(false);

  async function loadAll() {
    if (refreshInFlight.current) {
      refreshQueued.current = true;
      return;
    }
    refreshInFlight.current = true;
    try {
    const [servicesRes, ordersRes, activeRes] = await Promise.all([
      fetch("/api/driver/services").then((r) => r.json()),
      fetch("/api/driver/new-orders").then((r) => r.json()),
      fetch("/api/driver/active-orders").then((r) => r.json()),
    ]);
    if (servicesRes.success) setServices(servicesRes.data);
    if (ordersRes.success) {
      const nextOrders = ordersRes.data as any[];
      if (hasLoadedSounds.current) {
        nextOrders.forEach((order) => {
          const key = `${order.orderType}:${order.id}`;
          if (!knownOfferIds.current.has(key)) void notificationSound.play("ORDER_OFFER", `driver-offer:${key}`);
        });
      }
      nextOrders.forEach((order) => knownOfferIds.current.add(`${order.orderType}:${order.id}`));
      setOrders(nextOrders);
    }
    if (activeRes.success) {
      const nextActiveOrders = activeRes.data.orders as any[];
      if (hasLoadedSounds.current) {
        nextActiveOrders.forEach((order) => {
          const key = `${order.orderType}:${order.id}`;
          const previous = knownActiveStates.current.get(key);
          if (previous && previous !== order.requestStatus) {
            void notificationSound.play("ORDER_STATUS_CHANGED", `driver-status:${key}:${order.requestStatus}`);
          }
        });
      }
      nextActiveOrders.forEach((order) => knownActiveStates.current.set(`${order.orderType}:${order.id}`, order.requestStatus));
      setActiveOrders(nextActiveOrders);
      setConfirmTimeoutSec(activeRes.data.confirmTimeoutSec);
    }
    hasLoadedSounds.current = true;
    setLoading(false);
    } catch {
      // Preserve the last successful dashboard state until the next refresh.
    } finally {
      refreshInFlight.current = false;
      if (refreshQueued.current) {
        refreshQueued.current = false;
        void loadAll();
      }
    }
  }

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 10000); // növbəti mərhələdə Realtime ilə əvəz olunacaq
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadAll();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  async function toggleService(serviceType: string, enabled: boolean) {
    setServices((prev) => prev.map((s) => (s.service_type === serviceType ? { ...s, enabled } : s)));
    await fetch("/api/driver/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceType, enabled }),
    });
    loadAll();
  }

  async function respond(orderType: string, orderId: string, action: "accept" | "reject") {
    const res = await fetch(`/api/driver/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderType, orderId }),
    });
    const json = await res.json();
    if (json.success) {
      setOrders((prev) => prev.filter((order) => !(order.orderType === orderType && order.id === orderId)));
      loadAll();
    }
  }

  async function driverAction(orderType: string, orderId: string, action: "confirm" | "cancel" | "complete") {
    const res = await fetch(`/api/driver/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderType, orderId }),
    });
    const json = await res.json();
    if (json.success) {
      const status = action === "confirm" ? "CONFIRMED" : action === "complete" ? "COMPLETED" : "CANCELLED";
      const soundEvent = action === "complete" ? "ORDER_COMPLETED" : action === "cancel" ? "ORDER_CANCELLED" : "ORDER_STATUS_CHANGED";
      void notificationSound.play(soundEvent, `driver-status:${orderType}:${orderId}:${status}`);
    }
    loadAll();
  }

  return (
    <main className="min-h-screen p-6 max-w-sm mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-ink-muted text-sm">Xoş gəldiniz,</p>
          <h1 className="text-xl font-bold">{firstName}</h1>
        </div>
        <div className="flex items-center gap-1">
          <SoundToggle />
          <NotificationBell href="/driver/notifications" />
        </div>
      </div>

      <AnnouncementBanner />

      <section className="mb-8">
        <h2 className="font-semibold text-sm text-ink-muted uppercase tracking-wide mb-3">Aktiv Reyslər</h2>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {services.map((s) => (
            <div key={s.service_type} className="flex items-center justify-between p-4">
              <span className="font-medium text-sm">{SERVICE_LABELS[s.service_type] ?? s.service_type}</span>
              <button
                onClick={() => toggleService(s.service_type, !s.enabled)}
                className={`w-12 h-7 rounded-full transition-colors relative ${s.enabled ? "bg-success" : "bg-gray-200"}`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    s.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-sm text-ink-muted uppercase tracking-wide mb-3">Yeni Sifarişlər</h2>

        {loading && <p className="text-ink-muted text-sm">Yüklənir...</p>}
        {!loading && orders.length === 0 && (
          <p className="text-ink-muted text-sm">Hazırda yeni sifariş yoxdur.</p>
        )}

        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <div key={`${o.orderType}-${o.id}`} className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-primary mb-1">{ORDER_TYPE_LABEL[o.orderType]}</p>

              {o.orderType === "BAKU" && (
                <p className="text-sm mb-1">{o.pickup_location} → {o.dropoff_location} · {o.passenger_count} sərnişin</p>
              )}
              {o.orderType === "LOCAL" && (
                <p className="text-sm mb-1">{o.pickup_location} → {o.dropoff_location}</p>
              )}
              {o.orderType === "CARGO" && (
                <p className="text-sm mb-1">{o.sender_address} → {o.receiver_address}</p>
              )}

              <p className="font-bold text-ink mb-3">{o.total_price ?? o.price} AZN</p>

              <div className="flex gap-2">
                <button
                  onClick={() => respond(o.orderType, o.id, "accept")}
                  className="flex-1 min-h-[44px] rounded-xl bg-success text-white font-semibold text-sm"
                >
                  Qəbul Et
                </button>
                <button
                  onClick={() => respond(o.orderType, o.id, "reject")}
                  className="flex-1 min-h-[44px] rounded-xl bg-white border border-gray-200 text-ink font-semibold text-sm"
                >
                  İmtina Et
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-sm text-ink-muted uppercase tracking-wide mb-3">Aktiv Sifarişlərim</h2>

        {activeOrders.length === 0 && (
          <p className="text-ink-muted text-sm">Aktiv sifarişiniz yoxdur.</p>
        )}

        <div className="flex flex-col gap-3">
          {activeOrders.map((o) => (
            <div key={`${o.orderType}-${o.id}`} className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-primary mb-1">{ORDER_TYPE_LABEL[o.orderType]}</p>
              <p className="text-sm mb-1">{o.pickup_location ?? o.sender_address} → {o.dropoff_location ?? o.receiver_address}</p>
              <p className="text-sm text-ink-muted mb-2">{o.contact_phone ?? o.sender_phone}</p>
              <p className="font-bold text-ink mb-3">{o.price} AZN</p>

              {o.requestStatus === "SELECTED" && (
                <>
                  <p className="text-xs text-warning mb-2">
                    Müştəri sizi seçdi. Təsdiq üçün vaxt: {" "}
                    <Countdown
                      deadline={new Date(o.selectedAt).getTime() + confirmTimeoutSec * 1000}
                      onExpire={loadAll}
                    />
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => driverAction(o.orderType, o.id, "confirm")}
                      className="flex-1 min-h-[44px] rounded-xl bg-success text-white font-semibold text-sm"
                    >
                      Sifarişi təsdiqlə
                    </button>
                    <button
                      onClick={() => driverAction(o.orderType, o.id, "cancel")}
                      className="flex-1 min-h-[44px] rounded-xl bg-white border border-gray-200 text-ink font-semibold text-sm"
                    >
                      Sifarişi ləğv et
                    </button>
                  </div>
                </>
              )}

              {o.requestStatus === "CONFIRMED" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => driverAction(o.orderType, o.id, "complete")}
                    className="flex-1 min-h-[44px] rounded-xl bg-success text-white font-semibold text-sm"
                  >
                    Tamamlandı
                  </button>
                  <button
                    onClick={() => driverAction(o.orderType, o.id, "cancel")}
                    className="flex-1 min-h-[44px] rounded-xl bg-white border border-gray-200 text-danger font-semibold text-sm"
                  >
                    İmtina et
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Link href="/driver/profile" className="block text-center text-primary font-semibold text-sm mb-4">
        Profilim →
      </Link>
      <LogoutButton />
    </main>
  );
}
