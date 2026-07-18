import { StatusBadge, ORDER_TYPE_LABEL } from "@/components/StatusBadge";

const TYPE_IMAGE = {
  BAKU: "/illustrations/van-black.png",
  CARGO: "/illustrations/box-cargo.png",
  LOCAL: "/illustrations/taxi-local.png",
} as const;

export function routeLabel(order: any) {
  if (order.orderType === "CARGO") return `${order.sender_address} → ${order.receiver_address}`;
  return `${order.pickup_location} → ${order.dropoff_location}`;
}

export function priceLabel(order: any) {
  const amount = order.orderType === "BAKU" ? order.total_price ?? order.price : order.price;
  return `${amount} AZN`;
}

export function OrderRow({ order }: { order: any }) {
  const image = TYPE_IMAGE[order.orderType as keyof typeof TYPE_IMAGE] ?? TYPE_IMAGE.BAKU;
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="h-7 w-7 object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{ORDER_TYPE_LABEL[order.orderType]}</p>
        <p className="truncate text-xs text-ink-muted">{routeLabel(order)}</p>
        <p className="text-xs text-ink-muted">
          {new Date(order.created_at).toLocaleDateString("az-AZ")}, {new Date(order.created_at).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <p className="text-sm font-bold">{priceLabel(order)}</p>
        <StatusBadge status={order.status} />
      </div>
    </div>
  );
}
