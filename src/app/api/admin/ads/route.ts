import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import { adsService } from "@/modules/ads/ads.service";
import { logAudit } from "@/modules/logs/logs.service";
import { ok, created, fail } from "@/utils/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const ads = await adsService.listAll();
    return ok(ads);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    if (!body.title || !body.startsAt || !body.endsAt) {
      return fail("Başlıq, başlama və bitmə tarixi tələb olunur.", 422);
    }
    const ad = await adsService.create(body);
    await logAudit({ userId: admin.id, action: "CREATE_AD", module: "ads", meta: { adId: ad.id } });
    return created(ad, "Reklam əlavə edildi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
