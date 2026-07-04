import { NextRequest } from "next/server";
import { getSession } from "@/utils/session";
import { notificationsService } from "@/modules/notifications/notifications.service";
import { ok, fail } from "@/utils/api-response";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Giriş tələb olunur", 401);

  const { notificationId } = await req.json().catch(() => ({}));
  await notificationsService.markRead(session.id, notificationId);
  return ok(null, "Oxundu");
}
