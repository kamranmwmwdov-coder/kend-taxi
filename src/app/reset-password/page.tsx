"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, newPasswordConfirm }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setError("İnternet bağlantısı yoxdur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 max-w-sm mx-auto w-full">
      <Link href="/" className="mb-6 text-ink-muted"><ArrowLeft /></Link>
      <h1 className="text-xl font-bold mb-6">Yeni şifrə təyin et</h1>

      {!token ? (
        <p className="text-danger text-sm">Link etibarsızdır. Zəhmət olmasa emailinizdəki linkdən istifadə edin.</p>
      ) : success ? (
        <p className="text-success text-sm">Şifrə uğurla yeniləndi ✓ Ana səhifəyə yönləndirilirsiniz...</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Yeni şifrə" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Input label="Yeni şifrə (təkrar)" type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} />
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" loading={loading} disabled={newPassword.length < 6}>
            Şifrəni yenilə
          </Button>
        </form>
      )}
    </main>
  );
}
