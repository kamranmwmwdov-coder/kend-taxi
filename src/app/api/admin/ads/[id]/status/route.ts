import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import { adsService } from "@/modules/ads/ads.service";
import { ok, fail } from "@/utils/api-response";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const { status } = await req.json();
    await adsService.setStatus(params.id, status);
    return ok(null, "Status yeniləndi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
