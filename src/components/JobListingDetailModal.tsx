"use client";
import { useState, type ReactNode } from "react";
import { X, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export interface JobListing {
  id: string;
  title: string;
  category: string;
  contact_phone: string;
  whatsapp_phone: string | null;
  images: string[];
  price: number | null;
  event_date: string | null;
  event_time: string | null;
  address: string;
  description: string | null;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED";
  views_count: number;
  likes_count: number;
  dislikes_count: number;
  phone_clicks: number;
  whatsapp_clicks: number;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  user?: { first_name: string; last_name: string; phone: string } | null;
}

export function JobListingDetailModal({
  listing,
  mode,
  onClose,
  onSave,
}: {
  listing: JobListing;
  mode: "view" | "edit";
  onClose: () => void;
  onSave?: (patch: Partial<JobListing>) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(mode === "edit");
  const [form, setForm] = useState({
    title: listing.title,
    category: listing.category,
    contact_phone: listing.contact_phone,
    whatsapp_phone: listing.whatsapp_phone ?? "",
    price: listing.price?.toString() ?? "",
    event_date: listing.event_date ?? "",
    event_time: listing.event_time ?? "",
    address: listing.address,
    description: listing.description ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave({
        title: form.title,
        category: form.category,
        contact_phone: form.contact_phone,
        whatsapp_phone: form.whatsapp_phone || null,
        price: form.price ? Number(form.price) : null,
        event_date: form.event_date || null,
        event_time: form.event_time || null,
        address: form.address,
        description: form.description || null,
      });
      setIsEditing(false);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{isEditing ? "Elanı redaktə et" : "Elan detalları"}</h2>
          <button onClick={onClose} className="text-ink-muted">
            <X size={20} />
          </button>
        </div>

        {listing.images?.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {listing.images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={img} alt="" className="h-28 w-28 object-cover rounded-xl shrink-0" />
            ))}
          </div>
        )}

        {isEditing ? (
          <div className="flex flex-col gap-4">
            <Input label="İş adı" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input label="Kateqoriya" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input label="Telefon" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            <Input label="WhatsApp" value={form.whatsapp_phone} onChange={(e) => setForm({ ...form, whatsapp_phone: e.target.value })} />
            <Input label="Qiymət (AZN)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Tarix" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              <Input label="Saat" type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} />
            </div>
            <Input label="Ünvan" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-1">Ətraflı məlumat</label>
              <textarea
                className="input-field"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose} disabled={saving}>
                İmtina
              </Button>
              <Button onClick={handleSave} loading={saving}>
                Yadda saxla
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <Row label="Elan ID" value={listing.id} />
            <Row label="İş adı" value={listing.title} />
            <Row label="Kateqoriya" value={listing.category} />
            <Row label="İstifadəçi" value={listing.user ? `${listing.user.first_name} ${listing.user.last_name}` : "—"} />
            <Row label="Telefon" value={listing.contact_phone} icon={<Phone size={14} />} />
            <Row label="WhatsApp" value={listing.whatsapp_phone ?? "—"} icon={<MessageCircle size={14} />} />
            <Row label="Qiymət" value={listing.price ? `${listing.price} AZN` : "—"} />
            <Row label="Tarix" value={listing.event_date ?? "—"} />
            <Row label="Saat" value={listing.event_time ?? "—"} />
            <Row label="Ünvan" value={listing.address} />
            <Row label="Ətraflı məlumat" value={listing.description ?? "—"} />

            {listing.status === "ACTIVE" && (
              <>
                <hr className="my-2" />
                <Row label="👁 Baxış sayı" value={String(listing.views_count)} />
                <Row label="👍 Like sayı" value={String(listing.likes_count)} />
                <Row label="👎 Dislike sayı" value={String(listing.dislikes_count)} />
                <Row label="📞 Telefon klikləri" value={String(listing.phone_clicks)} />
                <Row label="💬 WhatsApp klikləri" value={String(listing.whatsapp_clicks)} />
                <Row label="📅 Paylaşılma tarixi" value={listing.published_at ? new Date(listing.published_at).toLocaleDateString("az-AZ") : "—"} />
                <Row label="📅 Bitmə tarixi" value={listing.expires_at ? new Date(listing.expires_at).toLocaleDateString("az-AZ") : "—"} />
              </>
            )}

            {onSave && (
              <div className="flex gap-3 mt-3">
                <Button variant="secondary" onClick={onClose}>
                  Bağla
                </Button>
                <Button onClick={() => setIsEditing(true)}>Redaktə et</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-50 pb-2">
      <span className="text-ink-muted flex items-center gap-1">
        {icon} {label}
      </span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
