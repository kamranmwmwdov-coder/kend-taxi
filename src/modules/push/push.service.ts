import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { getVapidDetails } from "@/utils/push";

type OrderType = "BAKU" | "LOCAL" | "CARGO";

type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
  type: "ORDER_OFFER" | "DRIVER_CONFIRMED";
};

type Vehicle = {
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  plate_number?: string | null;
} | null;

const webPush: {
  setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  sendNotification(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: string): Promise<unknown>;
} = require("web-push");

let vapidConfigured = false;

function configureVapid() {
  if (vapidConfigured) return;
  const { subject, publicKey, privateKey } = getVapidDetails();
  webPush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
<<<<<<< HEAD
=======

function numberLabel(value: unknown, suffix: string) {
  return typeof value === "number" || typeof value === "string" ? `${value} ${suffix}` : null;
}

function orderTypeLabel(orderType: OrderType) {
  return { BAKU: "Bakı reysi", LOCAL: "Rayon daxili", CARGO: "Yük çatdırılması" }[orderType];
}

function tripTimeLabel(value: unknown) {
  return { MORNING: "Səhər", NOON: "Günorta", EVENING: "Axşam" }[String(value)] ?? null;
}

/** Only order and vehicle fields that are safe for a lock-screen notification are whitelisted here. */
function orderDetails(orderType: OrderType, order: Record<string, unknown>) {
  const pickup = text(order.pickup_location) ?? text(order.sender_address);
  const destination = text(order.dropoff_location) ?? text(order.receiver_address);
  const price = order.total_price ?? order.price;
  const details = [
    pickup ? `Götürülmə: ${pickup}` : null,
    destination ? `Təyinat: ${destination}` : null,
    numberLabel(price, "AZN"),
  ];

  if (orderType === "BAKU") {
    details.push(
      text(order.trip_date) ? `Tarix: ${order.trip_date}` : null,
      tripTimeLabel(order.trip_time) ? `Vaxt: ${tripTimeLabel(order.trip_time)}` : null,
      numberLabel(order.passenger_count, "sərnişin"),
      text(order.luggage_info) ? `Əlavə yük: ${order.luggage_info}` : null
    );
  }
  if (orderType === "LOCAL") {
    details.push(
      order.trip_type === "ROUND_TRIP" ? "Gediş-dönüş" : "Tək istiqamət",
      order.waiting_enabled && order.waiting_hours ? `Gözləmə: ${order.waiting_hours} saat` : null,
      text(order.note) ? `Qeyd: ${order.note}` : null
    );
  }
  if (orderType === "CARGO") details.push(text(order.cargo_info) ? `Yük: ${order.cargo_info}` : null);

  return details.filter((detail): detail is string => Boolean(detail));
}

function vehicleLabel(vehicle: Vehicle) {
  if (!vehicle) return null;
  const name = [text(vehicle.brand), text(vehicle.model)].filter((value): value is string => Boolean(value)).join(" ");
  const details = [name, text(vehicle.color), text(vehicle.plate_number)].filter((value): value is string => Boolean(value));
  return details.length > 0 ? `Maşın: ${details.join(" · ")}` : null;
}

async function sendToUsers(userIds: string[], payload: PushPayload) {
  const uniqueUserIds = [...new Set(userIds)];
  if (uniqueUserIds.length === 0) return;
  configureVapid();

  const { data: rows, error } = await getSupabaseAdmin()
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("user_id", uniqueUserIds)
    .is("deleted_at", null);
  if (error) throw error;

  const subscriptions = [...new Map((rows ?? []).map((row) => [row.endpoint, row])).values()];
  const serializedPayload = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webPush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        serializedPayload
      )
    )
  );

  const invalidEndpoints = results.flatMap((result, index) => {
    if (result.status === "fulfilled") return [];
    const statusCode = (result.reason as { statusCode?: number })?.statusCode;
    return statusCode === 404 || statusCode === 410 ? [subscriptions[index].endpoint] : [];
  });
  if (invalidEndpoints.length > 0) {
    await getSupabaseAdmin()
      .from("push_subscriptions")
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .in("endpoint", invalidEndpoints);
  }
}

export const pushService = {
  async sendNewOrderOffer(userIds: string[], orderType: OrderType, order: Record<string, unknown>) {
    await sendToUsers(userIds, {
      type: "ORDER_OFFER",
      title: `Yeni sifariş · ${orderTypeLabel(orderType)}`,
      body: orderDetails(orderType, order).join("\n"),
      url: "/driver/home",
      tag: `order-offer:${orderType}:${order.id}`,
    });
  },

  async sendDriverConfirmed(userIds: string[], orderType: OrderType, order: Record<string, unknown>, vehicle: Vehicle) {
    await sendToUsers(userIds, {
      type: "DRIVER_CONFIRMED",
      title: "Sürücü yoldadır",
      body: [orderTypeLabel(orderType), ...orderDetails(orderType, order), vehicleLabel(vehicle)]
        .filter((detail): detail is string => Boolean(detail))
        .join("\n"),
      url: `/customer/orders/${orderType.toLowerCase()}/${order.id}`,
      tag: `order-status:driver-confirmed:${order.id}`,
    });
  },

  async sendNotificationToUsers(userIds: string[], title: string, body: string, url: string, tag: string) {
    if (userIds.length === 0) return;
    configureVapid();
>>>>>>> dc461376d27d4e2d60c3a9ee6785986cf89e5efd

function numberLabel(value: unknown, suffix: string) {
  return typeof value === "number" || typeof value === "string" ? `${value} ${suffix}` : null;
}

function orderTypeLabel(orderType: OrderType) {
  return { BAKU: "Bakı reysi", LOCAL: "Rayon daxili", CARGO: "Yük çatdırılması" }[orderType];
}

function tripTimeLabel(value: unknown) {
  return { MORNING: "Səhər", NOON: "Günorta", EVENING: "Axşam" }[String(value)] ?? null;
}

/** Only order and vehicle fields that are safe for a lock-screen notification are whitelisted here. */
function orderDetails(orderType: OrderType, order: Record<string, unknown>) {
  const pickup = text(order.pickup_location) ?? text(order.sender_address);
  const destination = text(order.dropoff_location) ?? text(order.receiver_address);
  const price = order.total_price ?? order.price;
  const details = [
    pickup ? `Götürülmə: ${pickup}` : null,
    destination ? `Təyinat: ${destination}` : null,
    numberLabel(price, "AZN"),
  ];

  if (orderType === "BAKU") {
    details.push(
      text(order.trip_date) ? `Tarix: ${order.trip_date}` : null,
      tripTimeLabel(order.trip_time) ? `Vaxt: ${tripTimeLabel(order.trip_time)}` : null,
      numberLabel(order.passenger_count, "sərnişin"),
      text(order.luggage_info) ? `Əlavə yük: ${order.luggage_info}` : null
    );
  }
  if (orderType === "LOCAL") {
    details.push(
      order.trip_type === "ROUND_TRIP" ? "Gediş-dönüş" : "Tək istiqamət",
      order.waiting_enabled && order.waiting_hours ? `Gözləmə: ${order.waiting_hours} saat` : null,
      text(order.note) ? `Qeyd: ${order.note}` : null
    );
  }
  if (orderType === "CARGO") details.push(text(order.cargo_info) ? `Yük: ${order.cargo_info}` : null);

  return details.filter((detail): detail is string => Boolean(detail));
}

function vehicleLabel(vehicle: Vehicle) {
  if (!vehicle) return null;
  const name = [text(vehicle.brand), text(vehicle.model)].filter((value): value is string => Boolean(value)).join(" ");
  const details = [name, text(vehicle.color), text(vehicle.plate_number)].filter((value): value is string => Boolean(value));
  return details.length > 0 ? `Maşın: ${details.join(" · ")}` : null;
}

async function sendToUsers(userIds: string[], payload: PushPayload) {
  const uniqueUserIds = [...new Set(userIds)];
  if (uniqueUserIds.length === 0) return;
  configureVapid();

  const { data: rows, error } = await getSupabaseAdmin()
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("user_id", uniqueUserIds)
    .is("deleted_at", null);
  if (error) throw error;

  const subscriptions = [...new Map((rows ?? []).map((row) => [row.endpoint, row])).values()];
  const serializedPayload = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webPush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        serializedPayload
      )
    )
  );

  const invalidEndpoints = results.flatMap((result, index) => {
    if (result.status === "fulfilled") return [];
    const statusCode = (result.reason as { statusCode?: number })?.statusCode;
    return statusCode === 404 || statusCode === 410 ? [subscriptions[index].endpoint] : [];
  });
  if (invalidEndpoints.length > 0) {
    await getSupabaseAdmin()
      .from("push_subscriptions")
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .in("endpoint", invalidEndpoints);
  }
}

<<<<<<< HEAD
export const pushService = {
  async sendNewOrderOffer(userIds: string[], orderType: OrderType, order: Record<string, unknown>) {
    await sendToUsers(userIds, {
      type: "ORDER_OFFER",
      title: `Yeni sifariş · ${orderTypeLabel(orderType)}`,
      body: orderDetails(orderType, order).join("\n"),
      url: "/driver/home",
      tag: `order-offer:${orderType}:${order.id}`,
    });
  },

  async sendDriverConfirmed(userIds: string[], orderType: OrderType, order: Record<string, unknown>, vehicle: Vehicle) {
    await sendToUsers(userIds, {
      type: "DRIVER_CONFIRMED",
      title: "Sürücü yoldadır",
      body: [orderTypeLabel(orderType), ...orderDetails(orderType, order), vehicleLabel(vehicle)]
        .filter((detail): detail is string => Boolean(detail))
        .join("\n"),
      url: `/customer/orders/${orderType.toLowerCase()}/${order.id}`,
      tag: `order-status:driver-confirmed:${order.id}`,
=======
    const subscriptions = [...new Map((rows ?? []).map((row) => [row.endpoint, row])).values()];
    const payload = JSON.stringify({ title, body, url, tag });
    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webPush.sendNotification(
          { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
          payload
        )
      )
    );

    const invalidEndpoints = results.flatMap((result, index) => {
      if (result.status === "fulfilled") return [];
      const statusCode = (result.reason as { statusCode?: number })?.statusCode;
      return statusCode === 404 || statusCode === 410 ? [subscriptions[index].endpoint] : [];
>>>>>>> dc461376d27d4e2d60c3a9ee6785986cf89e5efd
    });
  },
};
