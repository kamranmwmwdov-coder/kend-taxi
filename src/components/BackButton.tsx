"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  function handleClick() {
    router.back();
  }

  return (
    <button type="button" onClick={handleClick} className="mb-6 inline-block text-ink-muted" aria-label="Geri">
      <ArrowLeft />
    </button>
  );
}
