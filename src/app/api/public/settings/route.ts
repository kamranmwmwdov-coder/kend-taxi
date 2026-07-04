import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { ok, fail } from "@/utils/api-response";

const PUBLIC_KEYS = ["app_name", "whatsapp_admin_number"];

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("settings").select("key, value").in("key", PUBLIC_KEYS);
    if (error) throw error;
    const result = Object.fromEntries((data ?? []).map((s) => [s.key, s.value]));
    return ok(result);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", 500);
  }
}
