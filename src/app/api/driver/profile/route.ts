import { requireDriver } from "@/utils/require-role";
import { driverProfileService } from "@/modules/driver/driver-profile.service";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  try {
    const driver = await requireDriver();
    const profile = await driverProfileService.getProfile(driver.id);
    return ok(profile);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
