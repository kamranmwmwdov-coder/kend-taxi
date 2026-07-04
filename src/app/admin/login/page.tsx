"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      router.push("/admin");
    } catch {
      setError("İnternet bağlantısı yoxdur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-xl font-bold mb-1">Admin Panel</h1>
        <p className="text-ink-muted text-sm mb-6">Yalnız səlahiyyətli istifadəçilər üçün</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="İstifadəçi adı" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input label="Şifrə" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" loading={loading} disabled={!username || !password}>
            Daxil ol
          </Button>
        </form>
      </div>
    </main>
  );
}
