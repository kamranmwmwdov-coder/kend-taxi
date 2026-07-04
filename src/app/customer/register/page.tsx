"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PhoneInput } from "@/components/PhoneInput";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;
  const canSubmit =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    phone.length >= 9 &&
    password.length >= 6 &&
    !passwordsMismatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, password, passwordConfirm }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      // Hissə 2: qeydiyyatdan sonra avtomatik daxil olur
      router.push("/customer/home");
    } catch {
      setError("İnternet bağlantısı yoxdur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 max-w-sm mx-auto w-full">
      <Link href="/customer/login" className="mb-6 text-ink-muted"><ArrowLeft /></Link>
      <h1 className="text-xl font-bold mb-6">Qeydiyyatdan Keç</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Ad" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Input label="Soyad" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <PhoneInput value={phone} onChange={setPhone} />
        <Input label="Şifrə" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input
          label="Şifrəni təkrar et"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          error={passwordsMismatch ? "Şifrələr uyğun gəlmir" : undefined}
        />

        {error && <p className="text-danger text-sm">{error}</p>}

        <Button type="submit" loading={loading} disabled={!canSubmit}>
          Qeydiyyatdan keç
        </Button>
      </form>
    </main>
  );
}
