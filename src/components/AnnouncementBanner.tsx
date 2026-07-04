"use client";
import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
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
        <div key={a.id} className="bg-warning/10 rounded-2xl p-4 flex gap-3">
          <Megaphone size={18} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">{a.title}</p>
            <p className="text-sm text-ink-muted">{a.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
