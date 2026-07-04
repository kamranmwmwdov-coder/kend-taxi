import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import { announcementsService } from "@/modules/announcements/announcements.service";
import { logAudit } from "@/modules/logs/logs.service";
import { ok, created, fail } from "@/utils/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const items = await announcementsService.listAll();
    return ok(items);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    if (!body.title || !body.content) return fail("Başlıq və mətn tələb olunur.", 422);

    const item = await announcementsService.create(body);
    await logAudit({ userId: admin.id, action: "CREATE_ANNOUNCEMENT", module: "announcements", meta: { id: item.id } });
    return created(item, "Elan yaradıldı");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
