import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { getVapidDetails } from "@/utils/push";

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

export const pushService = {
  async sendNewOrderOffer(userIds: string[], orderType: "BAKU" | "LOCAL" | "CARGO", orderId: string) {
    if (userIds.length === 0) return;
    configureVapid();

    const { data: rows, error } = await getSupabaseAdmin()
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .in("user_id", [...new Set(userIds)])
      .is("deleted_at", null);
    if (error) throw error;

    const subscriptions = [...new Map((rows ?? []).map((row) => [row.endpoint, row])).values()];
    const payload = JSON.stringify({
      type: "ORDER_OFFER",
      title: "Yeni sifariş",
      body: "Sizə uyğun yeni sifariş var.",
      url: "/driver/home",
      tag: `order-offer:${orderType}:${orderId}`,
    });

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
    });
    if (invalidEndpoints.length > 0) {
      await getSupabaseAdmin()
        .from("push_subscriptions")
        .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .in("endpoint", invalidEndpoints);
    }
  },
};
