import { requireAdmin } from "@/utils/require-admin";
import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, phone, status, created_at")
      .eq("role", "CUSTOMER")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ok(data);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
