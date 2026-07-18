"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Briefcase, MapPin, Calendar, Clock, Eye, ThumbsUp, ThumbsDown, Heart, Phone, MessageCircle } from "lucide-react";
import type { CustomerJobListing, MyReaction } from "./types";
import { timeAgo, formatEventDate, formatEventTime, formatPrice } from "./types";
import { normalizePhone } from "@/utils/phone";

async function sendReaction(id: string, type: "LIKE" | "DISLIKE" | "FAVORITE"): Promise<MyReaction | null> {
  try {
    const res = await fetch(`/api/customer/job-listings/${id}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const json = await res.json();
    if (!json.success) return null;
    return json.data.myReaction as MyReaction;
  } catch {
    return null;
  }
}

function sendContactClick(id: string, kind: "phone" | "whatsapp") {
  fetch(`/api/customer/job-listings/${id}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  }).catch(() => {});
}

export function JobListingCard({ listing }: { listing: CustomerJobListing }) {
  const [reaction, setReaction] = useState<MyReaction>(listing.myReaction);
  const [likesCount, setLikesCount] = useState(listing.likes_count);
  const [dislikesCount, setDislikesCount] = useState(listing.dislikes_count);
  const [pending, setPending] = useState(false);

  async function handleReact(e: React.MouseEvent, type: "LIKE" | "DISLIKE" | "FAVORITE") {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setPending(true);

    // Optimistic UI yeniləməsi
    const prev = reaction;
    if (type === "LIKE") {
      setReaction({ ...reaction, liked: !reaction.liked, disliked: false });
      setLikesCount((c) => c + (reaction.liked ? -1 : 1));
      if (reaction.disliked) setDislikesCount((c) => c - 1);
    } else if (type === "DISLIKE") {
      setReaction({ ...reaction, disliked: !reaction.disliked, liked: false });
      setDislikesCount((c) => c + (reaction.disliked ? -1 : 1));
      if (reaction.liked) setLikesCount((c) => c - 1);
    } else {
      setReaction({ ...reaction, favorited: !reaction.favorited });
    }

    const result = await sendReaction(listing.id, type);
    if (!result) {
      // Xəta olarsa geri qaytar
      setReaction(prev);
      setLikesCount(listing.likes_count);
      setDislikesCount(listing.dislikes_count);
    }
    setPending(false);
  }

  function handleCall(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    sendContactClick(listing.id, "phone");
    window.location.href = `tel:${normalizePhone(listing.contact_phone)}`;
  }

  function handleWhatsapp(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const phone = listing.whatsapp_phone ?? listing.contact_phone;
    sendContactClick(listing.id, "whatsapp");
    const digits = normalizePhone(phone).replace("+", "");
    window.open(`https://wa.me/${digits}`, "_blank");
  }

  const userName = listing.user ? `${listing.user.first_name} ${listing.user.last_name}` : "İstifadəçi";
  const userInitial = listing.user?.first_name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <Link
      href={`/customer/job-listings/${listing.id}`}
      className={clsx(
        "block rounded-2xl bg-white p-4 shadow-sm transition-transform active:scale-[0.99]",
        listing.is_vip
          ? "border-2 border-transparent bg-clip-padding [background-image:linear-gradient(white,white),linear-gradient(135deg,#5B4FE5,#E08A1D)] [background-origin:border-box] [background-clip:padding-box,border-box]"
          : "border border-gray-100"
      )}
    >
      {/* Üst sətir: kateqoriya + etiketlər */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <Briefcase size={13} />
          {listing.category}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {listing.is_urgent && (
            <span className="rounded-full bg-danger/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-danger">
              Təcili
            </span>
          )}
          {listing.is_vip && (
            <span className="rounded-full bg-gradient-to-r from-primary to-warning px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              VIP
            </span>
          )}
        </div>
      </div>

      {/* Başlıq */}
      <h3 className="mb-1.5 line-clamp-2 text-base font-bold text-ink">{listing.title}</h3>

      {/* Meta: ünvan / tarix / saat */}
      <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          <MapPin size={13} /> {listing.address}
        </span>
        {listing.event_date && (
          <span className="flex items-center gap-1">
            <Calendar size={13} /> {formatEventDate(listing.event_date)}
          </span>
        )}
        {listing.event_time && (
          <span className="flex items-center gap-1">
            <Clock size={13} /> {formatEventTime(listing.event_time)}
          </span>
        )}
      </div>

      <p className="mb-2 text-sm font-bold text-primary">{formatPrice(listing.price)}</p>

      {listing.description && (
        <p className="mb-3 line-clamp-2 text-sm text-ink-muted">{listing.description}</p>
      )}

      <div className="mb-3 flex items-center justify-between border-t border-gray-50 pt-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
            {userInitial}
          </div>
          <span className="truncate text-xs font-medium text-ink-muted">{userName}</span>
        </div>
        <span className="shrink-0 text-xs text-ink-muted">{timeAgo(listing.published_at ?? listing.created_at)}</span>
      </div>

      <div className="mb-3 flex items-center justify-between border-t border-gray-50 pt-2.5">
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="flex items-center gap-1">
            <Eye size={15} /> {listing.views_count}
          </span>
          <button
            type="button"
            onClick={(e) => handleReact(e, "LIKE")}
            className={clsx("flex items-center gap-1", reaction.liked && "font-semibold text-success")}
          >
            <ThumbsUp size={15} fill={reaction.liked ? "currentColor" : "none"} /> {likesCount}
          </button>
          <button
            type="button"
            onClick={(e) => handleReact(e, "DISLIKE")}
            className={clsx("flex items-center gap-1", reaction.disliked && "font-semibold text-danger")}
          >
            <ThumbsDown size={15} fill={reaction.disliked ? "currentColor" : "none"} /> {dislikesCount}
          </button>
        </div>
        <button type="button" onClick={(e) => handleReact(e, "FAVORITE")} aria-label="Seçilmişlərə əlavə et">
          <Heart size={19} className={reaction.favorited ? "text-danger" : "text-ink-muted"} fill={reaction.favorited ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCall}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white active:bg-primary-dark"
        >
          <Phone size={15} /> Zəng et
        </button>
        <button
          type="button"
          onClick={handleWhatsapp}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success py-2.5 text-sm font-semibold text-white active:bg-success-dark"
        >
          <MessageCircle size={15} /> WhatsApp
        </button>
      </div>
    </Link>
  );
}
