"use client";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useSharedNotifications } from "@/components/SoundNotificationProvider";

export function NotificationBell({ href }: { href: string }) {
  const { unreadCount: count } = useSharedNotifications();

  return (
    <Link href={href} className="relative inline-flex p-2 text-ink">
      <Bell size={22} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
