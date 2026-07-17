"use client";
import { useRouter } from "next/navigation";
import { MaskIcon } from "@/components/MaskIcon";

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
      <MaskIcon src="/icons/logout.svg" className="h-[19px] w-[19px]" />
    </button>
  );
}
