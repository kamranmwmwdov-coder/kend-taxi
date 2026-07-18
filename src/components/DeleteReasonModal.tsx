"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/Button";

const REASONS = [
  "Söyüş və təhqir",
  "Spam",
  "Yanlış məlumat",
  "Təkrar elan",
  "Qaydalara uyğun deyil",
  "Digər",
];

export function DeleteReasonModal({
  title,
  onClose,
  onConfirm,
}: {
  title: string;
  onClose: () => void;
  onConfirm: (reason: string, note?: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!reason) {
      setError("Zəhmət olmasa səbəb seçin.");
      return;
    }
    if (reason === "Digər" && !note.trim()) {
      setError("\"Digər\" seçildikdə izah yazılmalıdır.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onConfirm(reason, note.trim() || undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Elanı sil</h2>
          <button onClick={onClose} className="text-ink-muted">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-ink-muted mb-4">
          <span className="font-semibold text-ink">{title}</span> elanını silmək istədiyinizə əminsiniz? Səbəb seçin:
        </p>

        <div className="flex flex-col gap-2 mb-4">
          {REASONS.map((r) => (
            <label
              key={r}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm cursor-pointer ${
                reason === r ? "border-primary bg-primary/5" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="delete-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              {r}
            </label>
          ))}
        </div>

        {reason === "Digər" && (
          <textarea
            className="input-field mb-4"
            placeholder="Səbəbi izah edin..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        )}

        {error && <p className="text-danger text-sm mb-3">{error}</p>}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            İmtina
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={loading}>
            Sil
          </Button>
        </div>
      </div>
    </div>
  );
}
