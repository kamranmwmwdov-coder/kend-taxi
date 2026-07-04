import { requireCustomer } from "@/utils/require-role";
import { ordersService, OrderError } from "@/modules/orders/orders.service";
import { ok, fail } from "@/utils/api-response";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const customer = await requireCustomer();
    const order = await ordersService.increasePrice(customer.id, params.id);
    return ok(order, "Qiymət artırıldı");
  } catch (err: any) {
    if (err instanceof OrderError) return fail(err.message, err.status);
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
