import { getSession } from "@/utils/session";
import { notificationsService } from "@/modules/notifications/notifications.service";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Giriş tələb olunur", 401);

  const [items, unreadCount] = await Promise.all([
    notificationsService.list(session.id),
    notificationsService.unreadCount(session.id),
  ]);
  return ok({ items, unreadCount });
}
