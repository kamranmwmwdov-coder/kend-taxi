const STATUS_MAP: Record<string, { label: string; className: string }> = {
  NEW: { label: "Yeni", className: "bg-gray-100 text-status-new" },
  WAITING_DRIVER: { label: "Sürücü gözlənilir", className: "bg-orange-50 text-status-waiting" },
  WAITING_CONFIRMATION: { label: "Təsdiq gözlənilir", className: "bg-blue-50 text-status-accepted" },
  ACTIVE: { label: "Aktiv", className: "bg-green-50 text-status-active" },
  COMPLETED: { label: "Tamamlandı", className: "bg-green-100 text-status-completed" },
  CANCELLED: { label: "Ləğv edildi", className: "bg-red-50 text-status-cancelled" },
  EXPIRED: { label: "Vaxtı bitdi", className: "bg-gray-100 text-status-new" },
};

export function StatusBadge({ status }: { status: string }) {
  const info = STATUS_MAP[status] ?? { label: status, className: "bg-gray-100 text-ink-muted" };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${info.className}`}>
      {info.label}
    </span>
  );
}

export const ORDER_TYPE_LABEL: Record<string, string> = {
  BAKU: "Bakı Reysi",
  CARGO: "El Yükü",
  LOCAL: "Rayon Daxili",
};
