import { requireDriver } from "@/utils/require-role";
import { ordersService } from "@/modules/orders/orders.service";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  try {
    const driver = await requireDriver();
    const orders = await ordersService.getNewOrdersForDriver(driver.id);
    return ok(orders);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
