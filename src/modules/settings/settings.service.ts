import { getSupabaseAdmin } from "@/utils/supabase-admin";

export async function getPublicSettings() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("settings").select("key, value").in("key", ["app_name", "whatsapp_admin_number"]);
  const map = Object.fromEntries((data ?? []).map((s) => [s.key, s.value]));
  return {
    appName: (map.app_name as string) ?? "Kənd Taxi",
    whatsappAdmin: (map.whatsapp_admin_number as string) ?? "",
  };
}
