"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function CargoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    senderName: "", senderPhone: "", senderAddress: "",
    receiverName: "", receiverPhone: "", receiverAddress: "",
    cargoInfo: "", price: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
    form.senderName && form.senderPhone && form.senderAddress &&
    form.receiverName && form.receiverPhone && form.receiverAddress &&
    Number(form.price) > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/customer/cargo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      router.push(`/customer/orders/cargo/${json.data.id}`);
    } catch {
      setError("İnternet bağlantısı yoxdur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-8 max-w-sm mx-auto">
      <Link href="/customer/home" className="mb-6 inline-block text-ink-muted"><ArrowLeft /></Link>
      <h1 className="text-xl font-bold mb-6">El Yükü</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-ink-muted uppercase tracking-wide">Göndərən</p>
        <Input label="Ad Soyad" value={form.senderName} onChange={(e) => setForm({ ...form, senderName: e.target.value })} />
        <Input label="Telefon" value={form.senderPhone} onChange={(e) => setForm({ ...form, senderPhone: e.target.value })} />
        <Input label="Götürüləcək ünvan" value={form.senderAddress} onChange={(e) => setForm({ ...form, senderAddress: e.target.value })} />

        <p className="text-sm font-semibold text-ink-muted uppercase tracking-wide mt-2">Təhvil alan</p>
        <Input label="Ad Soyad" value={form.receiverName} onChange={(e) => setForm({ ...form, receiverName: e.target.value })} />
        <Input label="Telefon" value={form.receiverPhone} onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })} />
        <Input label="Çatdırılacaq ünvan" value={form.receiverAddress} onChange={(e) => setForm({ ...form, receiverAddress: e.target.value })} />

        <p className="text-sm font-semibold text-ink-muted uppercase tracking-wide mt-2">Yük</p>
        <Input label="Yük haqqında məlumat" value={form.cargoInfo} onChange={(e) => setForm({ ...form, cargoInfo: e.target.value })} />
        <Input label="Qiymət (AZN)" type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />

        {error && <p className="text-danger text-sm">{error}</p>}

        <Button type="submit" loading={loading} disabled={!canSubmit}>Sifariş yarat</Button>
      </form>
    </main>
  );
}
