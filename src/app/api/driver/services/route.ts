import { NextRequest } from "next/server";
import { requireDriver } from "@/utils/require-role";
import { ordersService } from "@/modules/orders/orders.service";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  try {
    const driver = await requireDriver();
    const services = await ordersService.getDriverServices(driver.id);
    return ok(services);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const driver = await requireDriver();
    const { serviceType, enabled } = await req.json();
    await ordersService.setDriverService(driver.id, serviceType, enabled);
    return ok(null, "Yeniləndi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
