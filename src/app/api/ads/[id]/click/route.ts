import { adsService } from "@/modules/ads/ads.service";
import { ok, fail } from "@/utils/api-response";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await adsService.registerClick(params.id);
    return ok(null);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", 500);
  }
}
