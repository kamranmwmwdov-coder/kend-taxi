"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  function handleClick() {
    // Səhifə yeni tab-da açılıbsa (məs. qeydiyyat formasından "_blank" ilə),
    // tarixçədə geri gedəcək yer olmur — belə halda ana səhifəyə yönləndiririk.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button type="button" onClick={handleClick} className="mb-6 inline-block text-ink-muted" aria-label="Geri">
      <ArrowLeft />
    </button>
  );
}
