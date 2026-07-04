import { NextRequest } from "next/server";
import { requireDriver } from "@/utils/require-role";
import { ordersService } from "@/modules/orders/orders.service";
import { ok, fail } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const driver = await requireDriver();
    const { orderType, orderId } = await req.json();
    await ordersService.driverReject(driver.id, orderType, orderId);
    return ok(null, "Sifariş rədd edildi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
