"use client";
import { useEffect, useState } from "react";
import { Megaphone, ChevronRight } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at?: string;
}

export function AnnouncementBanner() {
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch("/api/announcements/active")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setItems(json.data);
      });
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-4">
      {items.map((a) => (
        <div key={a.id} className="flex items-start gap-3 rounded-2xl bg-danger/10 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger text-white">
            <Megaphone size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-danger">Vacib elan</span>
              {a.created_at && (
                <span className="shrink-0 text-[11px] text-ink-muted">
                  {new Date(a.created_at).toLocaleDateString("az-AZ")}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold leading-snug text-ink">{a.title}</p>
            <p className="text-sm text-ink-muted">{a.content}</p>
          </div>
          <ChevronRight size={18} className="mt-1 shrink-0 text-danger" />
        </div>
      ))}
    </div>
  );
}
