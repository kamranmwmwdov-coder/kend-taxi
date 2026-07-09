"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";

const FIELDS: { key: string; label: string; type: "number" | "text"; hint?: string }[] = [
  { key: "baku_base_price", label: "Bakı standart gediş haqqı (AZN)", type: "number" },
  { key: "driver_confirm_timeout_seconds", label: "Sürücü təsdiq müddəti (saniyə)", type: "number", hint: "Standart: 120 (2 dəqiqə)" },
  { key: "driver_accept_timeout_seconds", label: "Sürücü qəbul gözləmə müddəti (saniyə)", type: "number", hint: "Standart: 300 (5 dəqiqə)" },
  { key: "local_price_increase_amount", label: "Rayon Daxili qiymət artımı (AZN)", type: "number" },
  { key: "local_price_increase_max_count", label: "Maksimum artım sayı", type: "number" },
  { key: "baku_trip_capacity", label: "Bakı reysi sərnişin tutumu", type: "number" },
  { key: "whatsapp_admin_number", label: "WhatsApp əlaqə nömrəsi", type: "text" },
  { key: "app_name", label: "Sistem adı", type: "text" },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setValues(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(key: string) {
    setSavingKey(key);
    setMessage("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: values[key] }),
    });
    const json = await res.json();
    setMessage(json.success ? "Yadda saxlanıldı ✓" : json.message);
    setSavingKey(null);
  }

  if (loading) return <p className="text-ink-muted">Yüklənir...</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Parametrlər</h1>
      {message && <p className="text-success text-sm mb-4">{message}</p>}

      <div className="flex flex-col gap-4">
        {FIELDS.map(({ key, label, type, hint }) => (
          <div key={key} className="bg-white rounded-2xl p-4 border border-gray-100">
            <label className="block text-sm font-medium mb-1">{label}</label>
            {hint && <p className="text-xs text-ink-muted mb-2">{hint}</p>}
            <div className="flex gap-2">
              <input
                type={type}
                className="input-field"
                value={typeof values[key] === "string" ? values[key] : values[key] ?? ""}
                onChange={(e) =>
                  setValues({ ...values, [key]: type === "number" ? Number(e.target.value) : e.target.value })
                }
              />
              <Button
                className="!w-auto px-4"
                onClick={() => save(key)}
                loading={savingKey === key}
              >
                Yadda saxla
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
