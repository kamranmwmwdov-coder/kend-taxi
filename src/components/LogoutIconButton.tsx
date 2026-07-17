"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutIconButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }
  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Çıxış et"
      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-danger/20 bg-danger/5 text-danger"
    >
      <LogOut size={19} />
    </button>
  );
}
