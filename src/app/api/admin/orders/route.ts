import { requireAdmin } from "@/utils/require-admin";
import { adminOrdersRepository } from "@/modules/admin/admin-orders.repository";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const orders = await adminOrdersRepository.listAllOrders();
    return ok(orders);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
