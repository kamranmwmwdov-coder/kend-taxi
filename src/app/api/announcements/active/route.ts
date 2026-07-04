import { NextRequest } from "next/server";
import { getSession } from "@/utils/session";
import { announcementsService } from "@/modules/announcements/announcements.service";
import { ok, fail } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !["CUSTOMER", "DRIVER"].includes(session.role)) return fail("Giriş tələb olunur", 401);

  try {
    const items = await announcementsService.getActiveFor(session.role as "CUSTOMER" | "DRIVER");
    return ok(items);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", 500);
  }
}
