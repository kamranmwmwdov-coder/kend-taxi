import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import { adminService, AdminError } from "@/modules/admin/admin.service";
import { ok, fail } from "@/utils/api-response";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    await adminService.deleteDriver(params.id, admin.id);
    return ok(null, "Sürücü silindi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    await adminService.updateDriver(params.id, body, admin.id);
    return ok(null, "Sürücü məlumatları yeniləndi");
  } catch (err: any) {
    if (err instanceof AdminError) return fail(err.message, err.status);
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
