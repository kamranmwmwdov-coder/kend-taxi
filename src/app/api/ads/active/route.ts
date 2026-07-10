import { adsService } from "@/modules/ads/ads.service";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  try {
    const ad = await adsService.getActiveAd("ALL");
    return ok(ad);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", 500);
  }
}
