import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import { adminService, AdminError } from "@/modules/admin/admin.service";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await adminService.getSettings();
    return ok(settings);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { key, value } = await req.json();
    await adminService.updateSetting(key, value, admin.id);
    return ok(null, "Parametr yeniləndi");
  } catch (err: any) {
    if (err instanceof AdminError) return fail(err.message, err.status);
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
