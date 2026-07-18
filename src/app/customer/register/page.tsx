"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PhoneInput } from "@/components/PhoneInput";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { isValidEmail } from "@/utils/reset-token";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;
  const emailInvalid = email.trim().length > 0 && !isValidEmail(email);
  const canSubmit =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    phone.length >= 9 &&
    !emailInvalid &&
    password.length >= 6 &&
    !passwordsMismatch &&
    termsAccepted;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email: email.trim() || undefined,
          password,
          passwordConfirm,
        }),
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
        <div>
          <Input
            label="E-poçt"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailInvalid ? "Düzgün email daxil edin" : undefined}
          />
          <p className="text-xs text-ink-muted mt-1">
            Bu e-poçt ünvanı yalnız şifrənizi unutduğunuz halda hesabınızı bərpa etmək üçün istifadə olunacaq.
          </p>
        </div>
        <Input label="Şifrə" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input
          label="Şifrəni təkrar et"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          error={passwordsMismatch ? "Şifrələr uyğun gəlmir" : undefined}
        />

        {error && <p className="text-danger text-sm">{error}</p>}

        <Checkbox
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          label={
            <>
              <Link href="/terms" target="_blank" className="text-primary font-medium underline">
                İstifadə Şərtləri
              </Link>{" "}
              və{" "}
              <Link href="/privacy" target="_blank" className="text-primary font-medium underline">
                Məxfilik Siyasəti
              </Link>{" "}
              ilə tanış oldum və qəbul edirəm.
            </>
          }
        />

        <Button type="submit" loading={loading} disabled={!canSubmit}>
          Qeydiyyatdan keç
        </Button>
      </form>
    </main>
  );
}

