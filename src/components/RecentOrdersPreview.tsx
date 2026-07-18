"use client";

import { useEffect, useState } from "react";
import { OrderRow } from "@/components/OrderRow";

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
      {orders.map((o) => (
        <div key={`${o.orderType}-${o.id}`} className="py-3 first:pt-0 last:pb-0">
          <OrderRow order={o} />
        </div>
      ))}
    </div>
  );
}
