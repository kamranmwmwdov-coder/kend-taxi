import { createClient } from "@supabase/supabase-js";

// Bu client yalnız server-side (API route-lar) daxilində istifadə olunur.
// Frontend-ə heç vaxt import edilməməlidir, çünki service_role key tam səlahiyyətlidir.
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) {
    throw new Error("Supabase environment dəyişənləri təyin edilməyib (.env faylını yoxlayın)");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
