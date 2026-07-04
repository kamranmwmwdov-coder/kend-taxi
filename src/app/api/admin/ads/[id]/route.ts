import { requireAdmin } from "@/utils/require-admin";
import { adsService } from "@/modules/ads/ads.service";
import { ok, fail } from "@/utils/api-response";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await adsService.softDelete(params.id);
    return ok(null, "Reklam silindi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
