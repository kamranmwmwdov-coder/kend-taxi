"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PhoneInput } from "@/components/PhoneInput";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

const WHATSAPP_TEXT = encodeURIComponent("Salam. Sürücü kimi sistemə qoşulmaq istəyirəm.");

export default function DriverLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState("994000000000");

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.whatsapp_admin_number) {
          setWhatsapp(String(json.data.whatsapp_admin_number).replace(/\D/g, ""));
        }
      });
  }, []);

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
      if (json.data.role !== "DRIVER") {
        setError("Bu hesab sürücü hesabı deyil.");
        return;
      }
      router.push("/driver/home");
    } catch {
      setError("İnternet bağlantısı yoxdur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 max-w-sm mx-auto w-full">
      <Link href="/" className="mb-6 text-ink-muted"><ArrowLeft /></Link>
      <h1 className="text-xl font-bold mb-6">Sürücü Girişi</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PhoneInput value={phone} onChange={setPhone} />
        <Input label="Şifrə" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <Link href="/forgot-password" className="text-primary text-sm font-semibold -mt-2 self-end">
          Şifrəni unutmusunuz?
        </Link>

        {error && <p className="text-danger text-sm">{error}</p>}

        <Button type="submit" loading={loading} disabled={phone.length < 9 || password.length < 1}>
          Daxil ol
        </Button>
      </form>

      <a
        href={`https://wa.me/${whatsapp}?text=${WHATSAPP_TEXT}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 text-center text-sm text-primary font-semibold"
      >
        Sürücü olmaq istəyirəm →
      </a>
    </main>
  );
}
