"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Clock, Eye, ThumbsUp, ThumbsDown, Heart, Phone, MessageCircle, User } from "lucide-react";
import clsx from "clsx";
import { JobListingCard } from "./JobListingCard";
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

export function JobListingDetailView({ id }: { id: string }) {
  const [listing, setListing] = useState<CustomerJobListing | null>(null);
  const [similar, setSimilar] = useState<CustomerJobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [reaction, setReaction] = useState<MyReaction>({ liked: false, disliked: false, favorited: false });
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const viewRecorded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/customer/job-listings/${id}`);
        const json = await res.json();
        if (!json.success) {
          setNotFound(true);
          return;
        }
        setListing(json.data.listing);
        setSimilar(json.data.similar);
        setReaction(json.data.listing.myReaction);
        setLikesCount(json.data.listing.likes_count);
        setDislikesCount(json.data.listing.dislikes_count);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!listing || viewRecorded.current) return;
    viewRecorded.current = true;
    fetch(`/api/customer/job-listings/${id}/view`, { method: "POST" }).catch(() => {});
  }, [listing, id]);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveImage(index);
  }

  async function handleReact(type: "LIKE" | "DISLIKE" | "FAVORITE") {
    if (!listing) return;
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
    if (!result) setReaction(prev);
  }

  function handleCall() {
    if (!listing) return;
    fetch(`/api/customer/job-listings/${listing.id}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "phone" }),
    }).catch(() => {});
    window.location.href = `tel:${normalizePhone(listing.contact_phone)}`;
  }

  function handleWhatsapp() {
    if (!listing) return;
    fetch(`/api/customer/job-listings/${listing.id}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "whatsapp" }),
    }).catch(() => {});
    const phone = listing.whatsapp_phone ?? listing.contact_phone;
    const digits = normalizePhone(phone).replace("+", "");
    window.open(`https://wa.me/${digits}`, "_blank");
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 pt-4 max-w-sm mx-auto">
        <div className="mb-3 h-9 w-9 animate-pulse rounded-full bg-white/60" />
        <div className="h-56 animate-pulse rounded-2xl bg-white/60" />
      </main>
    );
  }

  if (notFound || !listing) {
    return (
      <main className="min-h-screen px-4 pt-4 max-w-sm mx-auto">
        <Link href="/customer/job-listings" className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <ArrowLeft size={18} className="text-ink" />
        </Link>
        <div className="mt-16 text-center">
          <p className="font-semibold text-ink">Elan tapılmadı</p>
          <p className="mt-1 text-sm text-ink-muted">Bu elan artıq mövcud deyil və ya vaxtı bitib.</p>
        </div>
      </main>
    );
  }

  const userName = listing.user ? `${listing.user.first_name} ${listing.user.last_name}` : "İstifadəçi";

  return (
    <main className="min-h-screen px-4 pt-4 max-w-sm mx-auto pb-8">
      <Link href="/customer/job-listings" className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
        <ArrowLeft size={18} className="text-ink" />
      </Link>

      {listing.images.length > 0 ? (
        <div className="mb-4">
          <div
            ref={scrollerRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory gap-0 overflow-x-auto rounded-2xl"
            style={{ scrollbarWidth: "none" }}
          >
            {listing.images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={img} alt="" className="h-56 w-full shrink-0 snap-center rounded-2xl object-cover" />
            ))}
          </div>
          {listing.images.length > 1 && (
            <div className="mt-2 flex justify-center gap-1.5">
              {listing.images.map((_, i) => (
                <span key={i} className={clsx("h-1.5 rounded-full transition-all", i === activeImage ? "w-4 bg-primary" : "w-1.5 bg-gray-200")} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4 flex h-40 items-center justify-center rounded-2xl bg-primary/5">
          <span className="text-sm text-ink-muted">Şəkil əlavə edilməyib</span>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{listing.category}</span>
        <div className="flex gap-1.5">
          {listing.is_urgent && <span className="rounded-full bg-danger/10 px-2 py-1 text-[10px] font-bold uppercase text-danger">Təcili</span>}
          {listing.is_vip && <span className="rounded-full bg-gradient-to-r from-primary to-warning px-2 py-1 text-[10px] font-bold uppercase text-white">VIP</span>}
        </div>
      </div>

      <h1 className="mb-2 text-xl font-bold text-ink">{listing.title}</h1>

      <div className="mb-3 flex flex-col gap-1.5 text-sm text-ink-muted">
        <span className="flex items-center gap-2">
          <MapPin size={15} /> {listing.address}
        </span>
        {listing.event_date && (
          <span className="flex items-center gap-2">
            <Calendar size={15} /> {formatEventDate(listing.event_date)}
          </span>
        )}
        {listing.event_time && (
          <span className="flex items-center gap-2">
            <Clock size={15} /> {formatEventTime(listing.event_time)}
          </span>
        )}
      </div>

      <p className="mb-4 text-lg font-bold text-primary">{formatPrice(listing.price)}</p>

      {listing.description && (
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
          <h2 className="mb-1.5 text-sm font-bold text-ink">Ətraflı məlumat</h2>
          <p className="whitespace-pre-line text-sm text-ink-muted">{listing.description}</p>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User size={17} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{userName}</p>
            <p className="text-xs text-ink-muted">Paylaşıldı: {timeAgo(listing.published_at ?? listing.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex items-center gap-4 text-sm text-ink-muted">
          <span className="flex items-center gap-1.5">
            <Eye size={17} /> {listing.views_count}
          </span>
          <button
            type="button"
            onClick={() => handleReact("LIKE")}
            className={clsx("flex items-center gap-1.5", reaction.liked && "font-semibold text-success")}
          >
            <ThumbsUp size={17} fill={reaction.liked ? "currentColor" : "none"} /> {likesCount}
          </button>
          <button
            type="button"
            onClick={() => handleReact("DISLIKE")}
            className={clsx("flex items-center gap-1.5", reaction.disliked && "font-semibold text-danger")}
          >
            <ThumbsDown size={17} fill={reaction.disliked ? "currentColor" : "none"} /> {dislikesCount}
          </button>
        </div>
        <button type="button" onClick={() => handleReact("FAVORITE")} className="flex items-center gap-1.5 text-sm text-ink-muted">
          <Heart size={19} className={reaction.favorited ? "text-danger" : "text-ink-muted"} fill={reaction.favorited ? "currentColor" : "none"} />
          {reaction.favorited ? "Seçilmişlərdə" : "Seçilmişlərə əlavə et"}
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={handleCall}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-sm font-semibold text-white active:bg-primary-dark"
        >
          <Phone size={16} /> Zəng et
        </button>
        <button
          type="button"
          onClick={handleWhatsapp}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success py-3 text-sm font-semibold text-white active:bg-success-dark"
        >
          <MessageCircle size={16} /> WhatsApp
        </button>
      </div>

      {similar.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-bold text-ink">Oxşar elanlar</h2>
          <div className="flex flex-col gap-3">
            {similar.map((s) => (
              <JobListingCard key={s.id} listing={s} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
