import { getSupabaseAdmin } from "@/utils/supabase-admin";

export async function logAudit(input: {
  userId?: string;
  action: string;
  module: string;
  ipAddress?: string;
  device?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("audit_logs").insert({
      user_id: input.userId ?? null,
      action: input.action,
      module: input.module,
      ip_address: input.ipAddress ?? null,
      device: input.device ?? null,
      meta: input.meta ?? null,
    });
  } catch (err) {
    // Log yazılması əsas əməliyyatı dayandırmamalıdır
    console.error("Audit log xətası:", err);
  }
}
