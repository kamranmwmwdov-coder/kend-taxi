"use client";
import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { StatusBadge, ORDER_TYPE_LABEL } from "@/components/StatusBadge";

const TYPE_OPTIONS = ["Hamısı", "BAKU", "LOCAL", "CARGO"];
const STATUS_OPTIONS = ["Hamısı", "WAITING_DRIVER", "WAITING_CONFIRMATION", "ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED"];

function exportToCsv(rows: any[]) {
  const headers = ["Növ", "Müştəri", "Telefon", "Marşrut", "Qiymət", "Status", "Tarix"];
  const lines = rows.map((o) => [
    ORDER_TYPE_LABEL[o.orderType],
    `${o.customer?.first_name ?? ""} ${o.customer?.last_name ?? ""}`,
    o.customer?.phone ?? "",
    o.route,
    o.price,
    o.status,
    new Date(o.created_at).toLocaleString("az-AZ"),
  ]);
  const csv = [headers, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sifarisler-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("Hamısı");
  const [statusFilter, setStatusFilter] = useState("Hamısı");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrders(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (typeFilter !== "Hamısı" && o.orderType !== typeFilter) return false;
      if (statusFilter !== "Hamısı" && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const customerName = `${o.customer?.first_name ?? ""} ${o.customer?.last_name ?? ""}`.toLowerCase();
        if (!customerName.includes(q) && !o.customer?.phone?.includes(q)) return false;
      }
      return true;
    });
  }, [orders, typeFilter, statusFilter, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sifarişlər</h1>
        <button
          onClick={() => exportToCsv(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 bg-white border border-gray-200 text-ink px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          <Download size={16} /> CSV ixrac et
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className="input-field !min-h-[44px] !w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t === "Hamısı" ? "Bütün növlər" : ORDER_TYPE_LABEL[t]}</option>
          ))}
        </select>
        <select className="input-field !min-h-[44px] !w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "Hamısı" ? "Bütün statuslar" : s}</option>
          ))}
        </select>
        <input
          className="input-field !min-h-[44px] max-w-xs"
          placeholder="Müştəri adı/telefon axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-ink-muted">Yüklənir...</p>
      ) : filtered.length === 0 ? (
        <p className="text-ink-muted">Məlumat tapılmadı.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-muted border-b border-gray-100">
                <th className="p-4">Növ</th>
                <th className="p-4">Müştəri</th>
                <th className="p-4">Marşrut</th>
                <th className="p-4">Qiymət</th>
                <th className="p-4">Status</th>
                <th className="p-4">Tarix</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={`${o.orderType}-${o.id}`} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium">{ORDER_TYPE_LABEL[o.orderType]}</td>
                  <td className="p-4">{o.customer?.first_name} {o.customer?.last_name}<br /><span className="text-xs text-ink-muted">{o.customer?.phone}</span></td>
                  <td className="p-4 text-xs">{o.route}</td>
                  <td className="p-4 font-semibold">{o.price} AZN</td>
                  <td className="p-4"><StatusBadge status={o.status} /></td>
                  <td className="p-4 text-xs text-ink-muted">
                    {new Date(o.created_at).toLocaleDateString("az-AZ")}<br />
                    {new Date(o.created_at).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
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
