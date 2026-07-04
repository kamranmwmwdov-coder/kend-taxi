import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import { adminService } from "@/modules/admin/admin.service";
import { ok, fail } from "@/utils/api-response";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const { isActive } = await req.json();
    await adminService.setDriverActive(params.id, !!isActive, admin.id);
    return ok(null, isActive ? "Sürücü aktiv edildi" : "Sürücü deaktiv edildi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
