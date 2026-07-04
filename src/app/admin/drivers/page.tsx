"use client";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { PhoneInput } from "@/components/PhoneInput";

interface Driver {
  id: string;
  employee_code: string | null;
  is_active: boolean;
  user: { id: string; first_name: string; last_name: string; phone: string; status: string };
  vehicle: { brand: string; model: string | null; color: string; plate_number: string } | null;
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/drivers");
    const json = await res.json();
    if (json.success) setDrivers(json.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(driver: Driver) {
    await fetch(`/api/admin/drivers/${driver.id}/active`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !driver.is_active }),
    });
    load();
  }

  async function removeDriver(driver: Driver) {
    if (!confirm(`${driver.user.first_name} ${driver.user.last_name} sürücüsünü silmək istədiyinizə əminsiniz?`)) return;
    await fetch(`/api/admin/drivers/${driver.id}`, { method: "DELETE" });
    load();
  }

  const filtered = drivers.filter((d) => {
    const q = search.toLowerCase();
    return (
      !q ||
      d.user.first_name.toLowerCase().includes(q) ||
      d.user.last_name.toLowerCase().includes(q) ||
      d.user.phone.includes(q) ||
      d.vehicle?.plate_number.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sürücülər</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm"
        >
          <Plus size={18} /> Yeni sürücü
        </button>
      </div>

      <input
        placeholder="Axtarış: ad, telefon, dövlət nömrəsi..."
        className="input-field mb-4 max-w-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-ink-muted">Yüklənir...</p>
      ) : filtered.length === 0 ? (
        <p className="text-ink-muted">Məlumat tapılmadı.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-muted border-b border-gray-100">
                <th className="p-4">Ad Soyad</th>
                <th className="p-4">Telefon</th>
                <th className="p-4">Avtomobil</th>
                <th className="p-4">Nömrə</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium">{d.user.first_name} {d.user.last_name}</td>
                  <td className="p-4">{d.user.phone}</td>
                  <td className="p-4">{d.vehicle ? `${d.vehicle.brand} (${d.vehicle.color})` : "-"}</td>
                  <td className="p-4">{d.vehicle?.plate_number ?? "-"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        d.is_active ? "bg-success/10 text-success" : "bg-gray-100 text-ink-muted"
                      }`}
                    >
                      {d.is_active ? "Aktiv" : "Deaktiv"}
                    </span>
                  </td>
                  <td className="p-4 flex gap-3">
                    <button onClick={() => toggleActive(d)} className="text-primary font-medium text-sm">
                      {d.is_active ? "Deaktiv et" : "Aktiv et"}
                    </button>
                    <button onClick={() => setEditingDriver(d)} className="text-ink-muted font-medium text-sm">
                      Redaktə et
                    </button>
                    <button onClick={() => removeDriver(d)} className="text-danger font-medium text-sm">
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <NewDriverModal onClose={() => setShowModal(false)} onCreated={load} />}
      {editingDriver && (
        <EditDriverModal driver={editingDriver} onClose={() => setEditingDriver(null)} onSaved={load} />
      )}
    </div>
  );
}

function NewDriverModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", password: "",
    vehicleBrand: "", vehicleModel: "", vehicleColor: "", plateNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      onCreated();
      onClose();
    } catch {
      setError("İnternet bağlantısı yoxdur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Yeni Sürücü Əlavə Et</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Ad" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input label="Soyad" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <PhoneInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Input label="Şifrə" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="Avtomobil markası" value={form.vehicleBrand} onChange={(e) => setForm({ ...form, vehicleBrand: e.target.value })} />
          <Input label="Model (opsional)" value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} />
          <Input label="Rəngi" value={form.vehicleColor} onChange={(e) => setForm({ ...form, vehicleColor: e.target.value })} />
          <Input label="Dövlət qeydiyyat nişanı" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} />
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" loading={loading}>Əlavə et</Button>
        </form>
      </div>
    </div>
  );
}

function EditDriverModal({ driver, onClose, onSaved }: { driver: Driver; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    firstName: driver.user.first_name,
    lastName: driver.user.last_name,
    vehicleBrand: driver.vehicle?.brand ?? "",
    vehicleModel: driver.vehicle?.model ?? "",
    vehicleColor: driver.vehicle?.color ?? "",
    plateNumber: driver.vehicle?.plate_number ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers/${driver.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Sürücünü Redaktə Et</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <p className="text-xs text-ink-muted mb-3">Telefon: {driver.user.phone} (dəyişdirilə bilməz)</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Ad" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input label="Soyad" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Input label="Avtomobil markası" value={form.vehicleBrand} onChange={(e) => setForm({ ...form, vehicleBrand: e.target.value })} />
          <Input label="Model (opsional)" value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} />
          <Input label="Rəngi" value={form.vehicleColor} onChange={(e) => setForm({ ...form, vehicleColor: e.target.value })} />
          <Input label="Dövlət qeydiyyat nişanı" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} />
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" loading={loading}>Yadda saxla</Button>
        </form>
      </div>
    </div>
  );
}
