import { NextRequest } from "next/server";
import { requireDriver } from "@/utils/require-role";
import { ordersService, OrderError } from "@/modules/orders/orders.service";
import { ok, fail } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const driver = await requireDriver();
    const { orderType, orderId } = await req.json();
    await ordersService.driverComplete(driver.id, orderType, orderId);
    return ok(null, "Sifariş tamamlandı");
  } catch (err: any) {
    if (err instanceof OrderError) return fail(err.message, err.status);
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
