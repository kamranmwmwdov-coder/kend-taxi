"use client";

import { useEffect, useState } from "react";
import { Bus, Package, Car } from "lucide-react";
import { StatusBadge, ORDER_TYPE_LABEL } from "@/components/StatusBadge";

const TYPE_ICON = { BAKU: Bus, CARGO: Package, LOCAL: Car } as const;

function routeLabel(order: any) {
  if (order.orderType === "CARGO") return `${order.sender_address} → ${order.receiver_address}`;
  return `${order.pickup_location} → ${order.dropoff_location}`;
}

function priceLabel(order: any) {
  const amount = order.orderType === "BAKU" ? order.total_price ?? order.price : order.price;
  return `${amount} AZN`;
}

export function RecentOrdersPreview() {
  const [orders, setOrders] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/customer/orders")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrders(json.data.slice(0, 3));
      })
      .catch(() => setOrders([]));
  }, []);

  if (orders === null) {
    return <p className="text-sm text-ink-muted">Yüklənir...</p>;
  }

  if (orders.length === 0) {
    return <p className="text-sm text-ink-muted">Hələ heç bir sifarişiniz yoxdur.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-gray-50">
      {orders.map((o) => {
        const Icon = TYPE_ICON[o.orderType as keyof typeof TYPE_ICON] ?? Bus;
        return (
          <div key={`${o.orderType}-${o.id}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink-muted">
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{ORDER_TYPE_LABEL[o.orderType]}</p>
              <p className="truncate text-xs text-ink-muted">{routeLabel(o)}</p>
              <p className="text-xs text-ink-muted">
                {new Date(o.created_at).toLocaleDateString("az-AZ")}, {new Date(o.created_at).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <p className="text-sm font-bold">{priceLabel(o)}</p>
              <StatusBadge status={o.status} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
