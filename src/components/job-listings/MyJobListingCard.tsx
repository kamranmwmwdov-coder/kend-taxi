"use client";

import Link from "next/link";
import { Eye, ThumbsUp, ThumbsDown, Pencil, Trash2, Calendar } from "lucide-react";
import type { MyJobListing } from "./types";
import { daysRemaining } from "./types";

const STATUS_INFO: Record<MyJobListing["status"], { label: string; className: string }> = {
  ACTIVE: { label: "🟢 Aktiv", className: "bg-success/10 text-success" },
  PENDING: { label: "🟡 Moderator təsdiqi gözlənilir", className: "bg-warning/10 text-warning" },
  REJECTED: { label: "Paylaşılmadı", className: "bg-danger/10 text-danger" },
  EXPIRED: { label: "Müddəti bitdi", className: "bg-gray-100 text-ink-muted" },
};

export function MyJobListingCard({
  listing,
  onDelete,
}: {
  listing: MyJobListing;
  onDelete: (id: string) => void;
}) {
  const status = STATUS_INFO[listing.status];
  const remaining = listing.status === "ACTIVE" ? daysRemaining(listing.expires_at) : null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
        {remaining !== null && (
          <span className="flex shrink-0 items-center gap-1 text-xs text-ink-muted">
            <Calendar size={13} /> {remaining} gün qaldı
          </span>
        )}
      </div>

      <div className="flex gap-3">
        {listing.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.images[0]} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="mb-0.5 truncate text-sm font-bold text-ink">{listing.title}</h3>
          <p className="truncate text-xs text-ink-muted">
            {listing.city ? `${listing.city}, ${listing.address}` : listing.address}
          </p>
        </div>
      </div>

      {listing.status === "ACTIVE" && (
        <div className="mt-3 flex items-center gap-3 border-t border-gray-50 pt-2.5 text-xs text-ink-muted">
          <span className="flex items-center gap-1">
            <Eye size={14} /> {listing.views_count}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={14} /> {listing.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown size={14} /> {listing.dislikes_count}
          </span>
        </div>
      )}

      <div className="mt-3 flex gap-2 border-t border-gray-50 pt-3">
        <Link
          href={`/customer/job-listings/${listing.id}/edit`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-ink active:bg-gray-50"
        >
          <Pencil size={14} /> Redaktə et
        </Link>
        <button
          type="button"
          onClick={() => onDelete(listing.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-danger/20 py-2 text-sm font-semibold text-danger active:bg-danger/5"
        >
          <Trash2 size={14} /> Sil
        </button>
      </div>
    </div>
  );
}
