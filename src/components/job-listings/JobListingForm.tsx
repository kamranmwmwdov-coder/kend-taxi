"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { Input } from "@/components/Input";
import { PhoneInput } from "@/components/PhoneInput";
import { Button } from "@/components/Button";
import { JOB_LISTING_CATEGORIES, type MyJobListing } from "./types";

const MAX_IMAGES = 5;

export interface JobListingFormValues {
  title: string;
  category: string;
  city: string;
  address: string;
  price: string;
  eventDate: string;
  eventTime: string;
  contactPhone: string;
  whatsappPhone: string;
  description: string;
  images: string[];
}

function initialValuesFrom(listing?: MyJobListing): JobListingFormValues {
  if (!listing) {
    return {
      title: "",
      category: "",
      city: "",
      address: "",
      price: "",
      eventDate: "",
      eventTime: "",
      contactPhone: "",
      whatsappPhone: "",
      description: "",
      images: [],
    };
  }
  return {
    title: listing.title,
    category: listing.category,
    city: listing.city,
    address: listing.address,
    price: listing.price?.toString() ?? "",
    eventDate: listing.event_date ?? "",
    eventTime: listing.event_time ?? "",
    contactPhone: listing.contact_phone,
    whatsappPhone: listing.whatsapp_phone ?? "",
    description: listing.description ?? "",
    images: listing.images ?? [],
  };
}

export function JobListingForm({ listing, listingId }: { listing?: MyJobListing; listingId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(listingId);
  const [form, setForm] = useState<JobListingFormValues>(() => initialValuesFrom(listing));
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function update<K extends keyof JobListingFormValues>(key: K, value: JobListingFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const remaining = MAX_IMAGES - form.images.length;
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    setError(null);
    try {
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/customer/job-listings/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        update("images", [...form.images, json.data.url]);
      }
    } catch (err: any) {
      setError(err.message ?? "Şəkil yüklənərkən xəta baş verdi.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    update("images", form.images.filter((img) => img !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.category || !form.city.trim() || !form.address.trim() || !form.contactPhone.trim()) {
      setError("Zəhmət olmasa bütün məcburi sahələri doldurun.");
      return;
    }
    if (form.images.length === 0) {
      setError("Ən azı 1 şəkil əlavə edin.");
      return;
    }

    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      category: form.category,
      city: form.city.trim(),
      address: form.address.trim(),
      contactPhone: form.contactPhone,
      whatsappPhone: form.whatsappPhone || null,
      images: form.images,
      price: form.price ? Number(form.price) : null,
      eventDate: form.eventDate || null,
      eventTime: form.eventTime || null,
      description: form.description || null,
    };

    try {
      const res = await fetch(isEdit ? `/api/customer/job-listings/${listingId}` : "/api/customer/job-listings", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      router.push("/customer/job-listings/mine");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Xəta baş verdi.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="İş adı" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Məs: Bağ işçisi tələb olunur" required />

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-muted">Kateqoriya</label>
        <select
          className="input-field"
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          required
        >
          <option value="" disabled>
            Seçin...
          </option>
          {JOB_LISTING_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <Input label="Şəhər" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Məs: Şəki" required />
      <Input label="Ünvan" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Məs: Mərkəz bazarı yaxınlığı" required />
      <Input label="Qiymət (AZN, könüllü)" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="Boş saxlaya bilərsiniz" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Tarix (könüllü)" type="date" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} />
        <Input label="Saat (könüllü)" type="time" value={form.eventTime} onChange={(e) => update("eventTime", e.target.value)} />
      </div>

      <PhoneInput label="Əlaqə telefonu" value={form.contactPhone} onChange={(v) => update("contactPhone", v)} required />
      <PhoneInput label="WhatsApp (könüllü)" value={form.whatsappPhone} onChange={(v) => update("whatsappPhone", v)} />

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-muted">Ətraflı məlumat</label>
        <textarea
          className="input-field py-3"
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="İş barədə ətraflı yazın..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-muted">Şəkillər ({form.images.length}/{MAX_IMAGES})</label>
        <div className="flex flex-wrap gap-2">
          {form.images.map((img) => (
            <div key={img} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(img)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {form.images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-ink-muted"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
              <span className="text-[10px]">Əlavə et</span>
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleImageSelect} />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" loading={submitting || uploading}>
        {isEdit ? "Yenilə" : "Paylaş"}
      </Button>
    </form>
  );
}
