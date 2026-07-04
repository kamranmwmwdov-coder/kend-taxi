"use client";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_role: string;
  priority: number;
  status: string;
  starts_at: string;
  ends_at: string | null;
}

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/announcements");
    const json = await res.json();
    if (json.success) setItems(json.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(a: Announcement) {
    await fetch(`/api/admin/announcements/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: a.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }),
    });
    load();
  }

  async function remove(a: Announcement) {
    if (!confirm(`"${a.title}" elanını silmək istədiyinizə əminsiniz?`)) return;
    await fetch(`/api/admin/announcements/${a.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Elanlar</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm"
        >
          <Plus size={18} /> Yeni elan
        </button>
      </div>

      {loading ? (
        <p className="text-ink-muted">Yüklənir...</p>
      ) : items.length === 0 ? (
        <p className="text-ink-muted">Hələ elan yoxdur.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold">{a.title}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-gray-100 text-ink-muted"}`}>
                  {a.status === "ACTIVE" ? "Aktiv" : "Deaktiv"}
                </span>
              </div>
              <p className="text-sm text-ink-muted mb-2">{a.content}</p>
              <p className="text-xs text-ink-muted mb-3">Hədəf: {a.target_role} · Prioritet: {a.priority}</p>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(a)} className="text-primary font-medium text-sm">
                  {a.status === "ACTIVE" ? "Deaktiv et" : "Aktiv et"}
                </button>
                <button onClick={() => remove(a)} className="text-danger font-medium text-sm">Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <NewAnnouncementModal onClose={() => setShowModal(false)} onCreated={load} />}
    </div>
  );
}

function NewAnnouncementModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: "", content: "", targetRole: "ALL", priority: 0 });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Yeni Elan</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Başlıq" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1">Mətn</label>
            <textarea
              className="input-field !h-24"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hədəf istifadəçi qrupu</label>
            <select className="input-field" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
              <option value="ALL">Bütün istifadəçilər</option>
              <option value="CUSTOMER">Yalnız Müştərilər</option>
              <option value="DRIVER">Yalnız Sürücülər</option>
            </select>
          </div>
          <Input label="Prioritet" type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
          <Button type="submit" loading={loading}>Yayımla</Button>
        </form>
      </div>
    </div>
  );
}
