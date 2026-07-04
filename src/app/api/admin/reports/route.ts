import { requireAdmin } from "@/utils/require-admin";
import { adminOrdersRepository } from "@/modules/admin/admin-orders.repository";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const [driverStats, serviceStats] = await Promise.all([
      adminOrdersRepository.getDriverStats(),
      adminOrdersRepository.getServiceStats(),
    ]);
    return ok({ driverStats, serviceStats });
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
