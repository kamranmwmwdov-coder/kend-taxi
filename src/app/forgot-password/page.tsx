"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      setSent(true);
    } catch {
      setError("İnternet bağlantısı yoxdur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 max-w-sm mx-auto w-full">
      <Link href="/" className="mb-6 text-ink-muted"><ArrowLeft /></Link>
      <h1 className="text-xl font-bold mb-2">Şifrəni unutmusunuz?</h1>
      <p className="text-sm text-ink-muted mb-6">
        Qeydiyyat zamanı əlavə etdiyiniz emaili daxil edin, sizə bərpa linki göndərək.
      </p>

      {sent ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center text-center gap-3">
          <MailCheck className="text-primary" size={36} />
          <p className="font-semibold">Email göndərildi</p>
          <p className="text-sm text-ink-muted">
            Əgər bu email qeydiyyatdadırsa, bərpa linki poçt qutunuza göndərildi. Linkin ömrü 30 dəqiqədir.
          </p>
          <p className="text-xs text-ink-muted">
            Email gəlmədi? Profilinizə hələ email əlavə etməmiş ola bilərsiniz — daxil olduqdan sonra
            profil səhifəsindən əlavə edib bir daha cəhd edin.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="numune@gmail.com"
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" loading={loading} disabled={!email}>
            Bərpa linki göndər
          </Button>
        </form>
      )}
    </main>
  );
}
