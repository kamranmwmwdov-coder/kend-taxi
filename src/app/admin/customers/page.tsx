"use client";
import { useEffect, useState } from "react";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/customers");
    const json = await res.json();
    if (json.success) setCustomers(json.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleBlock(c: Customer) {
    const newStatus = c.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    await fetch(`/api/admin/customers/${c.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return !q || `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Müştərilər</h1>

      <input
        placeholder="Axtarış: ad, telefon..."
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
                <th className="p-4">Qeydiyyat</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium">{c.first_name} {c.last_name}</td>
                  <td className="p-4">{c.phone}</td>
                  <td className="p-4 text-xs text-ink-muted">{new Date(c.created_at).toLocaleDateString("az-AZ")}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === "BLOCKED" ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                      {c.status === "BLOCKED" ? "Bloklanıb" : "Aktiv"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleBlock(c)} className="text-primary font-medium text-sm">
                      {c.status === "BLOCKED" ? "Blokdan çıxar" : "Blok et"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
