import { requireAdmin } from "@/utils/require-admin";
import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { logAudit } from "@/modules/logs/logs.service";
import { ok, fail } from "@/utils/api-response";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("users")
      .update({ deleted_at: now })
      .eq("id", params.id)
      .eq("role", "CUSTOMER");
    if (error) throw error;

    await logAudit({ userId: admin.id, action: "DELETE_CUSTOMER", module: "admin", meta: { customerId: params.id } });
    return ok(null, "Müştəri silindi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
