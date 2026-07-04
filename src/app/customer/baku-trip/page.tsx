"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/Input";
import { PhoneInput } from "@/components/PhoneInput";
import { Button } from "@/components/Button";

const TIME_OPTIONS = [
  { value: "MORNING", label: "Səhər" },
  { value: "NOON", label: "Günorta" },
  { value: "EVENING", label: "Axşam" },
];

export default function BakuTripPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    tripDate: "",
    tripTime: "MORNING",
    pickup: "",
    dropoff: "",
    phone: "",
    passengerCount: 1,
    extraLuggage: false,
    luggageInfo: "",
    extraLuggagePrice: "0",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = form.tripDate && form.pickup && form.dropoff && form.phone.length >= 9;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/customer/baku-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, extraLuggagePrice: Number(form.extraLuggagePrice) }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      router.push(`/customer/orders/baku/${json.data.id}`);
    } catch {
      setError("İnternet bağlantısı yoxdur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-8 max-w-sm mx-auto">
      <Link href="/customer/home" className="mb-6 inline-block text-ink-muted"><ArrowLeft /></Link>
      <h1 className="text-xl font-bold mb-6">Bakı Reysi</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Tarix" type="date" value={form.tripDate} onChange={(e) => setForm({ ...form, tripDate: e.target.value })} />

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-1">Reys vaxtı</label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, tripTime: t.value })}
                className={`min-h-[48px] rounded-xl border font-medium text-sm ${
                  form.tripTime === t.value ? "bg-primary text-white border-primary" : "bg-white border-gray-200 text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Input label="Minmə nöqtəsi" value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })} />
        <Input label="Enmə nöqtəsi" value={form.dropoff} onChange={(e) => setForm({ ...form, dropoff: e.target.value })} />
        <PhoneInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />

        <Input
          label="Sərnişin sayı"
          type="number"
          min={1}
          max={10}
          value={form.passengerCount}
          onChange={(e) => setForm({ ...form, passengerCount: Number(e.target.value) })}
        />

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">Əlavə yük varmı?</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, extraLuggage: true })}
              className={`flex-1 min-h-[48px] rounded-xl border font-medium ${form.extraLuggage ? "bg-primary text-white border-primary" : "bg-white border-gray-200"}`}
            >
              Bəli
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, extraLuggage: false })}
              className={`flex-1 min-h-[48px] rounded-xl border font-medium ${!form.extraLuggage ? "bg-primary text-white border-primary" : "bg-white border-gray-200"}`}
            >
              Xeyr
            </button>
          </div>
        </div>

        {form.extraLuggage && (
          <>
            <Input label="Yük haqqında qısa məlumat" value={form.luggageInfo} onChange={(e) => setForm({ ...form, luggageInfo: e.target.value })} />
            <Input
              label="Əlavə yük üçün ödəyəcəyiniz məbləğ (AZN)"
              type="number"
              min={0}
              value={form.extraLuggagePrice}
              onChange={(e) => setForm({ ...form, extraLuggagePrice: e.target.value })}
            />
          </>
        )}

        {error && <p className="text-danger text-sm">{error}</p>}

        <Button type="submit" loading={loading} disabled={!canSubmit}>Sifariş yarat</Button>
      </form>
    </main>
  );
}
