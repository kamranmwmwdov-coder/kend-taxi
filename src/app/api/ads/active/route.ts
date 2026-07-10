import { adsService } from "@/modules/ads/ads.service";
import { ok, fail } from "@/utils/api-response";

export async function GET(req: Request) {
  try {
    const targetRole = new URL(req.url).searchParams.get("targetRole");
    const role = targetRole === "CUSTOMER" || targetRole === "DRIVER" ? targetRole : "ALL";
    const ads = await adsService.getActiveAds(role);
    return ok(ads);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", 500);
  }
}
