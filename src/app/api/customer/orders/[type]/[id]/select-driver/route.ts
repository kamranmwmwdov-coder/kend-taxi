import { NextRequest } from "next/server";
import { requireCustomer } from "@/utils/require-role";
import { ordersService, OrderError } from "@/modules/orders/orders.service";
import { ok, fail } from "@/utils/api-response";

export async function POST(req: NextRequest, { params }: { params: { type: string; id: string } }) {
  try {
    const customer = await requireCustomer();
    const { driverId } = await req.json();
    const order = await ordersService.selectDriver(customer.id, params.type.toUpperCase(), params.id, driverId);
    return ok(order, "Sürücü seçildi");
  } catch (err: any) {
    if (err instanceof OrderError) return fail(err.message, err.status);
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
