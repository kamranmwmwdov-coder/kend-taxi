"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PhoneInput } from "@/components/PhoneInput";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      router.push("/customer/home");
    } catch {
      setError("İnternet bağlantısı yoxdur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 max-w-sm mx-auto w-full">
      <Link href="/" className="mb-6 text-ink-muted"><ArrowLeft /></Link>
      <h1 className="text-xl font-bold mb-6">Müştəri Girişi</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PhoneInput value={phone} onChange={setPhone} />
        <Input label="Şifrə" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="text-danger text-sm">{error}</p>}

        <Button type="submit" loading={loading} disabled={phone.length < 9 || password.length < 1}>
          Daxil ol
        </Button>
      </form>

      <p className="text-center text-sm text-ink-muted mt-6">
        Hesabınız yoxdur?{" "}
        <Link href="/customer/register" className="text-primary font-semibold">Qeydiyyatdan keç</Link>
      </p>
    </main>
  );
}
