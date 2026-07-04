import { NextRequest } from "next/server";
import { requireCustomer } from "@/utils/require-role";
import { ordersService, OrderError } from "@/modules/orders/orders.service";
import { created, fail } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const customer = await requireCustomer();
    const body = await req.json();
    const order = await ordersService.createLocalTrip({ ...body, customerId: customer.id });
    return created(order, "Sifariş yaradıldı");
  } catch (err: any) {
    if (err instanceof OrderError) return fail(err.message, err.status);
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
