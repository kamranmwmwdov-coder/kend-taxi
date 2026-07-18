"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Briefcase } from "lucide-react";
import Link from "next/link";
import { JobListingCard } from "./JobListingCard";
import type { CustomerJobListing } from "./types";

const PAGE_SIZE = 10;

export function JobListingsFeed() {
  const [listings, setListings] = useState<CustomerJobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);

  const loadPage = useCallback(async (isFirst: boolean) => {
    if (isFirst) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await fetch(`/api/customer/job-listings?offset=${offsetRef.current}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const page: CustomerJobListing[] = json.data.listings;
      setListings((prev) => (isFirst ? page : [...prev, ...page]));
      setHasMore(json.data.hasMore);
      offsetRef.current += page.length;
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPage(true);
  }, [loadPage]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadPage(false);
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadPage]);

  return (
    <main className="min-h-screen px-4 pt-4 max-w-sm mx-auto">
      <Link href="/customer/home" className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
        <ArrowLeft size={18} className="text-ink" />
      </Link>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/60" />
          ))}
        </div>
      ) : listings.length === 0 && !error ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Briefcase size={26} className="text-primary" />
          </div>
          <p className="font-semibold text-ink">Hələ aktiv iş elanı yoxdur</p>
          <p className="text-sm text-ink-muted">Yeni elanlar əlavə olunan kimi burada görəcəksiniz.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pb-6">
          {listings.map((listing) => (
            <JobListingCard key={listing.id} listing={listing} />
          ))}
          <div ref={sentinelRef} />
          {loadingMore && <div className="py-4 text-center text-sm text-ink-muted">Yüklənir...</div>}
          {error && <div className="py-4 text-center text-sm text-danger">Yükləmə zamanı xəta baş verdi.</div>}
        </div>
      )}
    </main>
  );
}
