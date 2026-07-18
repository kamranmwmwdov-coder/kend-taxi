"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-6 inline-block text-ink-muted"
      aria-label="Geri"
    >
      <ArrowLeft />
    </button>
  );
}
