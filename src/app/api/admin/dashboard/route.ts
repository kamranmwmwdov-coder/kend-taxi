import { requireAdmin } from "@/utils/require-admin";
import { adminService } from "@/modules/admin/admin.service";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await adminService.dashboard();
    return ok(stats);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
