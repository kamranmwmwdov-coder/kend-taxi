import { requireCustomer } from "@/utils/require-role";
import { ordersService, OrderError } from "@/modules/orders/orders.service";
import { ok, fail } from "@/utils/api-response";

export async function GET(_req: Request, { params }: { params: { type: string; id: string } }) {
  try {
    const customer = await requireCustomer();
    const data = await ordersService.getOrderDetail(customer.id, params.type.toUpperCase(), params.id);
    return ok(data);
  } catch (err: any) {
    if (err instanceof OrderError) return fail(err.message, err.status);
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
