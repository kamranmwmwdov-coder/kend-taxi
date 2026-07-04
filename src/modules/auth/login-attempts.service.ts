import { getSupabaseAdmin } from "@/utils/supabase-admin";

const MAX_ATTEMPTS = 5;
const BLOCK_MS = 5 * 60 * 1000;

export const loginAttemptsService = {
  async checkBlocked(key: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("login_attempts").select("blocked_until").eq("key", key).maybeSingle();
    if (!data?.blocked_until) return false;
    return new Date(data.blocked_until).getTime() > Date.now();
  },

  async recordFailure(key: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("login_attempts").select("attempt_count").eq("key", key).maybeSingle();

    const nextCount = (data?.attempt_count ?? 0) + 1;
    const blockedUntil = nextCount >= MAX_ATTEMPTS ? new Date(Date.now() + BLOCK_MS).toISOString() : null;

    await supabase.from("login_attempts").upsert({
      key,
      attempt_count: blockedUntil ? 0 : nextCount,
      blocked_until: blockedUntil,
      updated_at: new Date().toISOString(),
    });
  },

  async reset(key: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    await supabase.from("login_attempts").delete().eq("key", key);
  },
};
