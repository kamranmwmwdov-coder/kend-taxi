"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MaskIcon } from "@/components/MaskIcon";
import { OrderRow } from "@/components/OrderRow";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/orders")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrders(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen px-6 py-8 max-w-sm mx-auto">
      <Link href="/customer/home" className="mb-6 inline-flex text-ink-muted">
        <MaskIcon src="/icons/arrow-right.svg" className="h-5 w-5 rotate-180 text-ink-muted" />
      </Link>
      <h1 className="text-xl font-bold mb-6">Sifariş Tarixçəm</h1>

      {loading && <p className="text-ink-muted">Yüklənir...</p>}

      {!loading && orders.length === 0 && (
        <p className="text-ink-muted text-center mt-12">Hələ heç bir sifarişiniz yoxdur.</p>
      )}

      <div className="flex flex-col gap-3">
        {orders.map((o) => {
          const isActive = ["NEW", "WAITING_DRIVER", "WAITING_CONFIRMATION", "ACTIVE"].includes(o.status);
          const typePath = o.orderType.toLowerCase() === "baku" ? "baku" : o.orderType.toLowerCase();
          const CardWrapper = isActive ? Link : "div";
          const wrapperProps = isActive ? { href: `/customer/orders/${typePath}/${o.id}` } : {};
          return (
            <CardWrapper
              key={`${o.orderType}-${o.id}`}
              {...(wrapperProps as any)}
              className="block rounded-2xl border border-gray-100 bg-white p-3"
            >
              <OrderRow order={o} />
              {isActive && (
                <p className="mt-2 pl-[52px] text-xs font-medium text-primary">Detallara bax →</p>
              )}
            </CardWrapper>
          );
        })}
      </div>
    </main>
  );
}
