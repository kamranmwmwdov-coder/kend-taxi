"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/Input";
import { PhoneInput } from "@/components/PhoneInput";
import { Button } from "@/components/Button";
import { notificationSound } from "@/utils/notification-sound";

export default function LocalTripPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    pickup: "", dropoff: "", phone: "",
    tripType: "ONE_WAY" as "ONE_WAY" | "ROUND_TRIP",
    waitingEnabled: false, waitingHours: "1",
    price: "", note: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = form.pickup && form.dropoff && form.phone.length >= 9 && Number(form.price) > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/customer/local-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          waitingHours: form.waitingEnabled ? Number(form.waitingHours) : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      void notificationSound.play("ORDER_CREATED", `customer-order-created:${json.data.id}`);
      router.push(`/customer/orders/local/${json.data.id}`);
    } catch {
      setError("İnternet bağlantısı yoxdur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-8 max-w-sm mx-auto">
      <Link href="/customer/home" className="mb-6 inline-block text-ink-muted"><ArrowLeft /></Link>
      <h1 className="text-xl font-bold mb-6">Rayon Daxili</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Götürüləcək ünvan" value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })} />
        <Input label="Gediləcək ünvan" value={form.dropoff} onChange={(e) => setForm({ ...form, dropoff: e.target.value })} />
        <PhoneInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">İstiqamət</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, tripType: "ONE_WAY" })}
              className={`flex-1 min-h-[48px] rounded-xl border font-medium ${form.tripType === "ONE_WAY" ? "bg-primary text-white border-primary" : "bg-white border-gray-200"}`}
            >
              Tək istiqamət
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, tripType: "ROUND_TRIP" })}
              className={`flex-1 min-h-[48px] rounded-xl border font-medium ${form.tripType === "ROUND_TRIP" ? "bg-primary text-white border-primary" : "bg-white border-gray-200"}`}
            >
              Gediş-Dönüş
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">Gözləmə olacaq?</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, waitingEnabled: true })}
              className={`flex-1 min-h-[48px] rounded-xl border font-medium ${form.waitingEnabled ? "bg-primary text-white border-primary" : "bg-white border-gray-200"}`}
            >
              Bəli
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, waitingEnabled: false })}
              className={`flex-1 min-h-[48px] rounded-xl border font-medium ${!form.waitingEnabled ? "bg-primary text-white border-primary" : "bg-white border-gray-200"}`}
            >
              Xeyr
            </button>
          </div>
        </div>

        {form.waitingEnabled && (
          <Input
            label="Gözləmə müddəti (saat)"
            type="number"
            min={1}
            value={form.waitingHours}
            onChange={(e) => setForm({ ...form, waitingHours: e.target.value })}
          />
        )}

        <Input
          label="Qiymət (AZN) — yol haqqı və gözləmə daxil olmaqla özünüz təklif edin"
          type="number"
          min={1}
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <Input label="Qeyd (opsional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />

        {error && <p className="text-danger text-sm">{error}</p>}

        <Button type="submit" loading={loading} disabled={!canSubmit}>Sifariş yarat</Button>
      </form>
    </main>
  );
}
