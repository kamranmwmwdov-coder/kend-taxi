export type PushSubscriptionInput = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
};

export function getVapidPublicKey() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) throw new Error("VAPID_PUBLIC_KEY is not configured.");
  return publicKey;
}

export function getVapidDetails() {
  const publicKey = getVapidPublicKey();
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!privateKey || !subject) throw new Error("VAPID sender configuration is not complete.");
  return { publicKey, privateKey, subject };
}

export function isValidPushSubscription(value: unknown): value is PushSubscriptionInput {
  if (!value || typeof value !== "object") return false;
  const subscription = value as PushSubscriptionInput;
  return Boolean(
    typeof subscription.endpoint === "string" &&
    subscription.endpoint.startsWith("https://") &&
    subscription.keys &&
    typeof subscription.keys.p256dh === "string" &&
    typeof subscription.keys.auth === "string"
  );
}
