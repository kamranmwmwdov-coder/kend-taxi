"use client";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { formatAzerbaijanDateTime } from "@/utils/azerbaijan-time";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  background_color: string | null;
  text_color: string | null;
  text_style: string | null;
  lent_color: string | null;
  priority: number;
  target_role: string;
  starts_at: string;
  ends_at: string;
  status: string;
  impressions: number;
  clicks: number;
}

interface PreviewProps {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  backgroundColor: string;
  textColor: string;
  textStyle: string;
  lentColor: string;
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
    if (!confirm(`"${ad.title}" reklamini silmek istediyinize eminsiniz?`)) return;
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
        <p className="text-ink-muted">Yuklenir...</p>
      ) : ads.length === 0 ? (
        <p className="text-ink-muted">Hele reklam yoxdur.</p>
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
              <p className="text-xs text-ink-muted mb-1">Hedef: {ad.target_role} | Prioritet: {ad.priority}</p>
              <p className="text-xs text-ink-muted mb-3">
                {formatAzerbaijanDateTime(ad.starts_at)} - {formatAzerbaijanDateTime(ad.ends_at)}
              </p>
              <p className="text-xs text-ink-muted mb-3">
                Gosterilme: {ad.impressions} | Klik: {ad.clicks}
              </p>
              <AdPreview
                title={ad.title}
                description={ad.description}
                imageUrl={ad.image_url}
                backgroundColor={ad.background_color || "#EEF2F7"}
                textColor={ad.text_color || "#1F2430"}
                textStyle={ad.text_style || "font-semibold"}
                lentColor={ad.lent_color || "#1D6FE0"}
              />
              <div className="flex gap-2 mt-3">
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
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    backgroundColor: "#EEF2F7",
    textColor: "#1F2430",
    textStyle: "font-semibold",
    lentColor: "#1D6FE0",
    priority: 0,
    targetRole: "CUSTOMER",
    startsAt: "",
    endsAt: "",
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
      setError("Sekil yuklene bilmedi.");
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
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Yeni Reklam</h2>
          <button onClick={onClose} type="button" aria-label="Bagla">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Reklam metni" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Elave metn (opsional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div>
            <label className="block text-sm font-medium mb-1">Reklam sekli</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="text-sm w-full"
            />
            {uploading && <p className="text-xs text-ink-muted mt-1">Yuklenir...</p>}
          </div>

          <Input label="Kecid linki (opsional)" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Fon rengi" type="color" value={form.backgroundColor} onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })} />
            <Input label="Metn rengi" type="color" value={form.textColor} onChange={(e) => setForm({ ...form, textColor: e.target.value })} />
            <Input label="Lent rengi" type="color" value={form.lentColor} onChange={(e) => setForm({ ...form, lentColor: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Metn stili</label>
            <select
              className="input-field"
              value={form.textStyle}
              onChange={(e) => setForm({ ...form, textStyle: e.target.value })}
            >
              <option value="font-medium">Normal</option>
              <option value="font-semibold">Qalin</option>
              <option value="font-bold">Daha qalin</option>
              <option value="font-semibold italic">Kursiv</option>
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-ink-muted mb-2">Canli onizleme</p>
            <AdPreview
              title={form.title || "Reklam metni"}
              description={form.description}
              imageUrl={form.imageUrl}
              backgroundColor={form.backgroundColor}
              textColor={form.textColor}
              textStyle={form.textStyle}
              lentColor={form.lentColor}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hedef istifadeci qrupu</label>
            <select
              className="input-field"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
            >
              <option value="ALL">Butun istifadeciler</option>
              <option value="CUSTOMER">Yalniz musteriler</option>
              <option value="DRIVER">Yalniz suruculer</option>
            </select>
          </div>

          <Input label="Prioritet" type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
          <Input label="Baslama tarixi" type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
          <Input label="Bitme tarixi" type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />

          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" loading={loading} disabled={uploading}>Yadda saxla ve yayinla</Button>
        </form>
      </div>
    </div>
  );
}

function AdPreview({ title, description, imageUrl, backgroundColor, textColor, textStyle, lentColor }: PreviewProps) {
  return (
    <div className="h-[20vh] min-h-[110px] overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div
        className="h-[65%] bg-cover bg-center"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundColor } : { backgroundColor }}
      />
      <div className="h-[30%] min-h-0 flex flex-col justify-center px-4" style={{ backgroundColor }}>
        <p className={`${textStyle} text-sm truncate`} style={{ color: textColor }}>
          {title}
        </p>
        {description && (
          <p className="text-xs truncate opacity-85" style={{ color: textColor }}>
            {description}
          </p>
        )}
      </div>
      <div className="h-[5%] min-h-[5px]" style={{ backgroundColor: lentColor }} aria-hidden="true" />
    </div>
  );
}
