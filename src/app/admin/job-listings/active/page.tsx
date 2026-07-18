"use client";
import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { JobListingDetailModal, type JobListing } from "@/components/JobListingDetailModal";
import { DeleteReasonModal } from "@/components/DeleteReasonModal";

function remainingDays(expiresAt: string | null): string {
  if (!expiresAt) return "—";
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? `${days} gün` : "Bitib";
}

export default function ActiveJobListingsPage() {
  const [items, setItems] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<JobListing | null>(null);
  const [editing, setEditing] = useState<JobListing | null>(null);
  const [deleting, setDeleting] = useState<JobListing | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/job-listings?status=ACTIVE");
    const json = await res.json();
    if (json.success) setItems(json.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveEdit(id: string, patch: Partial<JobListing>) {
    await fetch(`/api/admin/job-listings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await load();
  }

  async function confirmDelete(reason: string, note?: string) {
    if (!deleting) return;
    await fetch(`/api/admin/job-listings/${deleting.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, note }),
    });
    setDeleting(null);
    await load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Aktiv Elanlar</h1>

      {loading ? (
        <p className="text-ink-muted">Yüklənir...</p>
      ) : items.length === 0 ? (
        <p className="text-ink-muted">Aktiv elan yoxdur.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-muted border-b border-gray-100">
                <th className="p-4">İş adı</th>
                <th className="p-4">👁 Baxış</th>
                <th className="p-4">👍 / 👎</th>
                <th className="p-4">📞 / 💬</th>
                <th className="p-4">📅 Paylaşılıb</th>
                <th className="p-4">⏳ Qalan gün</th>
                <th className="p-4">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium">{item.title}</td>
                  <td className="p-4">{item.views_count}</td>
                  <td className="p-4">
                    {item.likes_count} / {item.dislikes_count}
                  </td>
                  <td className="p-4">
                    {item.phone_clicks} / {item.whatsapp_clicks}
                  </td>
                  <td className="p-4 text-xs text-ink-muted">
                    {item.published_at ? new Date(item.published_at).toLocaleDateString("az-AZ") : "—"}
                  </td>
                  <td className="p-4 text-xs">{remainingDays(item.expires_at)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button title="Bax" onClick={() => setViewing(item)} className="p-2 rounded-lg hover:bg-gray-50 text-ink-muted">
                        <Eye size={16} />
                      </button>
                      <button title="Redaktə et" onClick={() => setEditing(item)} className="p-2 rounded-lg hover:bg-gray-50 text-ink-muted">
                        <Pencil size={16} />
                      </button>
                      <button title="Sil" onClick={() => setDeleting(item)} className="p-2 rounded-lg hover:bg-red-50 text-danger">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <JobListingDetailModal
          listing={viewing}
          mode="view"
          onClose={() => setViewing(null)}
          onSave={(patch) => saveEdit(viewing.id, patch)}
        />
      )}
      {editing && (
        <JobListingDetailModal
          listing={editing}
          mode="edit"
          onClose={() => setEditing(null)}
          onSave={(patch) => saveEdit(editing.id, patch)}
        />
      )}
      {deleting && (
        <DeleteReasonModal title={deleting.title} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
      )}
    </div>
  );
}
