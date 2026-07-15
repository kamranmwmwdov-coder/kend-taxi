"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export function AddEmailForm() {
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/account/email")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.email) {
          setCurrentEmail(json.data.email);
          setEmail(json.data.email);
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/account/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      setSuccess("Email yadda saxlanıldı ✓");
    } catch {
      setError("İnternet bağlantısı yoxdur.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-primary font-semibold text-sm text-left">
        {currentEmail ? "Email ünvanını dəyiş" : "Şifrə bərpası üçün email əlavə et"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col gap-3">
      <p className="font-semibold text-sm">Şifrə bərpası üçün email</p>
      <p className="text-xs text-ink-muted">
        Şifrənizi unutsanız, bərpa linki bu emailə göndəriləcək.
      </p>
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="numune@gmail.com" />
      {error && <p className="text-danger text-sm">{error}</p>}
      {success && <p className="text-success text-sm">{success}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={loading} disabled={!email}>Yadda saxla</Button>
        <button type="button" onClick={() => setOpen(false)} className="text-ink-muted text-sm px-2">Bağla</button>
      </div>
    </form>
  );
}
