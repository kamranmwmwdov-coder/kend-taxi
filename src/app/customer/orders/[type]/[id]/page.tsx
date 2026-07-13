"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { Countdown } from "@/components/Countdown";
import { notificationSound } from "@/utils/notification-sound";
import { normalizePhone } from "@/utils/phone";

const STATUS_LABEL: Record<string, string> = {
  NEW: "Yeni",
  WAITING_DRIVER: "Sürücü axtarılır",
  WAITING_CONFIRMATION: "Sürücü təsdiqi gözlənilir",
  ACTIVE: "Yoldadır",
  COMPLETED: "Tamamlandı",
  CANCELLED: "Ləğv edildi",
  EXPIRED: "Vaxtı bitdi",
};

export default function OrderStatusPage() {
  const params = useParams<{ type: string; id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/customer/orders/${params.type}/${params.id}`);
    const json = await res.json();
    if (json.success) setData(json.data);
  }, [params.type, params.id]);

  useEffect(() => {
    load();
    // Realtime əvəzinə tez-tez polling (3 saniyə) - növbəti mərhələdə Supabase Realtime ilə əvəzlənəcək
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);

  if (!data) return <p className="p-6 text-ink-muted">Yüklənir...</p>;

  const { order, acceptedDrivers, selectedRequest, confirmTimeoutSec, acceptTimeoutSec, maxIncreaseCount, increaseAmount } = data;
  const isLocal = params.type === "local";
  const price = order.total_price ?? order.price;

  async function selectDriver(driverId: string) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/customer/orders/${params.type}/${params.id}/select-driver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId }),
    });
    const json = await res.json();
    if (!json.success) setError(json.message);
    else {
      void notificationSound.play("CUSTOMER_SELECTED", `customer-selected-driver:${params.type}:${params.id}:${driverId}`);
    }
    setBusy(false);
    load();
  }

  async function cancelOrder() {
    if (!confirm("Sifarişi ləğv etmək istədiyinizə əminsiniz?")) return;
    setBusy(true);
    await fetch(`/api/customer/orders/${params.type}/${params.id}/cancel`, { method: "POST" });
    setBusy(false);
    load();
  }

  async function increasePrice() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/customer/local-trip/${params.id}/increase-price`, { method: "POST" });
    const json = await res.json();
    if (!json.success) setError(json.message);
    setBusy(false);
    load();
  }

  const waitedTooLong =
    order.status === "WAITING_DRIVER" &&
    Date.now() - new Date(order.created_at).getTime() > acceptTimeoutSec * 1000 &&
    acceptedDrivers.length === 0;

  const canCancel = ["NEW", "WAITING_DRIVER", "WAITING_CONFIRMATION"].includes(order.status);

  return (
    <main className="min-h-screen p-6 max-w-sm mx-auto">
      <button onClick={() => router.push("/customer/orders")} className="mb-4 text-ink-muted">
        <ArrowLeft />
      </button>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-bold text-lg">{STATUS_LABEL[order.status] ?? order.status}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-2xl font-bold text-primary">{price} AZN</p>
      </div>

      {error && <p className="text-danger text-sm mb-3">{error}</p>}

      {/* Sürücü axtarılır, hələ heç kim qəbul etməyib */}
      {order.status === "WAITING_DRIVER" && acceptedDrivers.length === 0 && !waitedTooLong && (
        <p className="text-ink-muted text-sm">Sürücülər axtarılır, gözləyin...</p>
      )}

      {/* 5 dəqiqə keçib, heç kim qəbul etməyib */}
      {waitedTooLong && (
        <div className="bg-warning/10 rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium mb-3">Sifarişiniz hələ qəbul edilməyib.</p>
          {isLocal && order.price_increase_count < maxIncreaseCount ? (
            <Button onClick={increasePrice} loading={busy} variant="secondary" className="mb-2">
              Qiyməti +{increaseAmount} AZN artır
            </Button>
          ) : null}
          <Button onClick={cancelOrder} loading={busy} variant="danger">
            Sifarişi ləğv et
          </Button>
        </div>
      )}

      {/* Qəbul edən sürücülər - seçim */}
      {order.status === "WAITING_DRIVER" && acceptedDrivers.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-ink-muted">Qəbul edən sürücülər:</p>
          {acceptedDrivers.map((a: any) => (
            <div key={a.driver_id} className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="font-semibold">{a.driver.user.first_name} {a.driver.user.last_name}</p>
              <p className="text-sm text-ink-muted">{a.driver.user.phone}</p>
              <p className="text-sm text-ink-muted">
                {a.driver.vehicle?.brand} ({a.driver.vehicle?.color}) — {a.driver.vehicle?.plate_number}
              </p>
              <Button onClick={() => selectDriver(a.driver_id)} loading={busy} className="mt-3">
                Bu sürücünü seç
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Sürücü təsdiqi gözlənilir */}
      {order.status === "WAITING_CONFIRMATION" && selectedRequest && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
          <p className="text-sm text-ink-muted mb-2">Sürücü təsdiqi gözlənilir</p>
          <Countdown
            deadline={new Date(selectedRequest.selected_at).getTime() + confirmTimeoutSec * 1000}
            onExpire={load}
          />
        </div>
      )}

      {/* Aktiv sifariş - sürücü məlumatları tam görünür */}
      {order.status === "ACTIVE" && (
        <div className="bg-success/10 rounded-2xl p-5">
          <p className="font-semibold text-success mb-3">Sürücü yoldadır</p>
          {selectedRequest?.driver?.user?.phone && (
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-ink-muted">Sürücü</p>
              <p className="font-semibold">
                {selectedRequest.driver.user.first_name} {selectedRequest.driver.user.last_name}
              </p>
              <p className="text-xs text-ink-muted mt-2">Nömrəsi</p>
              <p className="font-semibold mb-3">{normalizePhone(selectedRequest.driver.user.phone)}</p>
              <div className="flex gap-2">
                <a
                  href={`tel:${normalizePhone(selectedRequest.driver.user.phone)}`}
                  className="flex-1 min-h-[40px] rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center"
                >
                  Zəng et
                </a>
                <a
                  href={`https://wa.me/${normalizePhone(selectedRequest.driver.user.phone).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-h-[40px] rounded-xl border border-gray-200 text-ink font-semibold text-sm flex items-center justify-center"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {order.status === "COMPLETED" && (
        <div className="bg-success/10 rounded-2xl p-5 text-center">
          <p className="font-semibold text-success">Sifariş tamamlandı ✓</p>
        </div>
      )}

      {["CANCELLED", "EXPIRED"].includes(order.status) && (
        <div className="bg-gray-100 rounded-2xl p-5 text-center">
          <p className="font-semibold text-ink-muted">Sifariş bağlanıb</p>
        </div>
      )}

      {canCancel && !waitedTooLong && (
        <button onClick={cancelOrder} className="mt-6 text-danger text-sm font-medium w-full text-center">
          Sifarişi ləğv et
        </button>
      )}
    </main>
  );
}
