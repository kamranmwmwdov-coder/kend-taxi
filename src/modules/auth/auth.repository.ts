import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { normalizePhone } from "@/utils/phone";

export const authRepository = {
  async findByPhone(phone: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", normalizePhone(phone))
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async findByUsername(username: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("role", "ADMIN")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createCustomer(input: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    passwordHash: string;
  }) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .insert({
        role: "CUSTOMER",
        first_name: input.firstName,
        last_name: input.lastName,
        phone: normalizePhone(input.phone),
        email: input.email ?? null,
        password_hash: input.passwordHash,
        status: "ACTIVE",
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.from("customer_profiles").insert({ user_id: data.id });
    return data;
  },

  async updateLastLogin(userId: string) {
    const supabase = getSupabaseAdmin();
    await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", userId);
  },
};
