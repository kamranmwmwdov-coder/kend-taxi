import { adsService } from "@/modules/ads/ads.service";
import { ok, fail } from "@/utils/api-response";

// Eyni səbəbdən (bax: api/public/settings) bu route də DB-ni dinamik
// oxumalıdır, yoxsa admin yeni reklam əlavə etsə belə köhnə/boş
// nəticə build-cache-dən qayıdar.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const ad = await adsService.getActiveAd("ALL");
    return ok(ad);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", 500);
  }
}
