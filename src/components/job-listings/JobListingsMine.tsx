"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Briefcase } from "lucide-react";
import { MyJobListingCard } from "./MyJobListingCard";
import type { MyJobListing } from "./types";

export function JobListingsMine() {
  const [listings, setListings] = useState<MyJobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/customer/job-listings/mine");
        const json = await res.json();
        if (json.success) setListings(json.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Bu elanı silmək istədiyinizə əminsiniz?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/customer/job-listings/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) setListings((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen px-4 pt-4 max-w-sm mx-auto pb-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/customer/profile" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <ArrowLeft size={18} className="text-ink" />
        </Link>
        <Link
          href="/customer/job-listings/new"
          className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-white active:bg-primary-dark"
        >
          <Plus size={16} /> Yeni elan
        </Link>
      </div>

      <h1 className="mb-4 text-xl font-bold text-ink">Elanlarım</h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/60" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Briefcase size={26} className="text-primary" />
          </div>
          <p className="font-semibold text-ink">Hələ elanınız yoxdur</p>
          <p className="text-sm text-ink-muted">İlk iş elanınızı yerləşdirin, moderator təsdiqindən sonra aktiv olacaq.</p>
          <Link href="/customer/job-listings/new" className="btn-primary mt-2 max-w-[220px]">
            Elan yerləşdir
          </Link>
        </div>
      ) : (
        <div className={`flex flex-col gap-3 ${deletingId ? "opacity-70" : ""}`}>
          {listings.map((listing) => (
            <MyJobListingCard key={listing.id} listing={listing} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  );
}
