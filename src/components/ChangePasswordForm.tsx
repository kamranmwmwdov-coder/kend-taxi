"use client";
import { useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      setSuccess("Şifrə uğurla dəyişdirildi ✓");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch {
      setError("İnternet bağlantısı yoxdur.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-primary font-semibold text-sm text-left">
        Şifrəni dəyiş
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col gap-3">
      <p className="font-semibold text-sm">Şifrəni dəyiş</p>
      <Input label="Cari şifrə" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      <Input label="Yeni şifrə" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <Input label="Yeni şifrə (təkrar)" type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} />
      {error && <p className="text-danger text-sm">{error}</p>}
      {success && <p className="text-success text-sm">{success}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={loading}>Yadda saxla</Button>
        <button type="button" onClick={() => setOpen(false)} className="text-ink-muted text-sm px-2">Bağla</button>
      </div>
    </form>
  );
}
