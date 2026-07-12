import { NextRequest } from "next/server";
import { getSession } from "@/utils/session";
import { fail, ok } from "@/utils/api-response";
import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { isValidPushSubscription } from "@/utils/push";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Login required", 401);

  const body = await req.json().catch(() => null);
  if (!isValidPushSubscription(body)) return fail("Invalid push subscription", 422);

  const { error } = await getSupabaseAdmin().from("push_subscriptions").upsert(
    {
      user_id: session.id,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      expiration_time: body.expirationTime ?? null,
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    { onConflict: "endpoint" }
  );
  if (error) return fail("Push subscription could not be saved", 500);
  return ok(null, "Push subscription saved");
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Login required", 401);

  const body = await req.json().catch(() => null);
  if (!body || typeof body.endpoint !== "string") return fail("Push endpoint is required", 422);

  const { error } = await getSupabaseAdmin()
    .from("push_subscriptions")
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("user_id", session.id)
    .eq("endpoint", body.endpoint);
  if (error) return fail("Push subscription could not be removed", 500);
  return ok(null, "Push subscription removed");
}
