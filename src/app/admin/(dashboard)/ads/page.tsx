"use client";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  priority: number;
  target_role: string;
  starts_at: string;
  ends_at: string;
  status: string;
  impressions: number;
  clicks: number;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/ads");
    const json = await res.json();
    if (json.success) setAds(json.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(ad: Ad) {
    await fetch(`/api/admin/ads/${ad.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: ad.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }),
    });
    load();
  }

  async function remove(ad: Ad) {
    if (!confirm(`"${ad.title}" reklamını silmək istədiyinizə əminsiniz?`)) return;
    await fetch(`/api/admin/ads/${ad.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reklamlar</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm"
        >
          <Plus size={18} /> Yeni reklam
        </button>
      </div>

      {loading ? (
        <p className="text-ink-muted">Yüklənir...</p>
      ) : ads.length === 0 ? (
        <p className="text-ink-muted">Hələ reklam yoxdur.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{ad.title}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ad.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-gray-100 text-ink-muted"}`}>
                  {ad.status === "ACTIVE" ? "Aktiv" : "Deaktiv"}
                </span>
              </div>
              <p className="text-xs text-ink-muted mb-1">Hədəf: {ad.target_role} · Prioritet: {ad.priority}</p>
              <p className="text-xs text-ink-muted mb-3">
                {new Date(ad.starts_at).toLocaleDateString("az-AZ")} — {new Date(ad.ends_at).toLocaleDateString("az-AZ")}
              </p>
              <p className="text-xs text-ink-muted mb-3">
                Göstərilmə: {ad.impressions} · Klik: {ad.clicks}
              </p>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(ad)} className="text-primary font-medium text-sm">
                  {ad.status === "ACTIVE" ? "Deaktiv et" : "Aktiv et"}
                </button>
                <button onClick={() => remove(ad)} className="text-danger font-medium text-sm">
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <NewAdModal onClose={() => setShowModal(false)} onCreated={load} />}
    </div>
  );
}

function NewAdModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "", description: "", imageUrl: "", linkUrl: "",
    priority: 0, targetRole: "ALL", startsAt: "", endsAt: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/ads/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      setForm((f) => ({ ...f, imageUrl: json.data.url }));
    } catch {
      setError("Şəkil yüklənə bilmədi.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Yeni Reklam</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Başlıq" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Qısa mətn (opsional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1">Şəkil (opsional)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="text-sm w-full"
            />
            {uploading && <p className="text-xs text-ink-muted mt-1">Yüklənir...</p>}
            {form.imageUrl && !uploading && (
              <img src={form.imageUrl} alt="Önizləmə" className="mt-2 h-20 rounded-lg object-cover" />
            )}
          </div>
          <Input label="Keçid linki (opsional)" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />

          <div>
            <label className="block text-sm font-medium mb-1">Hədəf istifadəçi qrupu</label>
            <select
              className="input-field"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
            >
              <option value="ALL">Bütün istifadəçilər</option>
              <option value="CUSTOMER">Yalnız Müştərilər</option>
              <option value="DRIVER">Yalnız Sürücülər</option>
            </select>
          </div>

          <Input label="Prioritet (böyük ədəd = əvvəl göstərilir)" type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
          <Input label="Başlama tarixi" type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
          <Input label="Bitmə tarixi" type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />

          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" loading={loading} disabled={uploading}>Əlavə et</Button>
        </form>
      </div>
    </div>
  );
}
