import { requireCustomer } from "@/utils/require-role";
import { ordersService } from "@/modules/orders/orders.service";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  try {
    const customer = await requireCustomer();
    const orders = await ordersService.getCustomerOrders(customer.id);
    return ok(orders);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
