import { getSupabaseAdmin } from "@/utils/supabase-admin";

export const passwordResetRepository = {
  async findUserByEmail(email: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async setUserEmail(userId: string, email: string) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("users").update({ email }).eq("id", userId);
    if (error) throw error;
  },

  async createToken(input: { userId: string; tokenHash: string; expiresAt: Date }) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("password_reset_tokens").insert({
      user_id: input.userId,
      token_hash: input.tokenHash,
      expires_at: input.expiresAt.toISOString(),
    });
    if (error) throw error;
  },

  async findValidToken(tokenHash: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token_hash", tokenHash)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async markTokenUsed(id: string) {
    const supabase = getSupabaseAdmin();
    await supabase.from("password_reset_tokens").update({ used_at: new Date().toISOString() }).eq("id", id);
  },

  async updatePassword(userId: string, passwordHash: string) {
    const supabase = getSupabaseAdmin();
    await supabase.from("users").update({ password_hash: passwordHash }).eq("id", userId);
  },
};
