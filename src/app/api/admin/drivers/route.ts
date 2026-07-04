import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import { adminService, AdminError } from "@/modules/admin/admin.service";
import { ok, created, fail } from "@/utils/api-response";

export async function GET() {
  try {
    const admin = await requireAdmin();
    void admin;
    const drivers = await adminService.listDrivers();
    return ok(drivers);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const driver = await adminService.createDriver(body, admin.id);
    return created(driver, "Sürücü uğurla əlavə edildi");
  } catch (err: any) {
    if (err instanceof AdminError) return fail(err.message, err.status);
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
