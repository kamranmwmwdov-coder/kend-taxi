import { getSupabaseAdmin } from "@/utils/supabase-admin";

export const announcementsService = {
  async listAll() {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(input: {
    title: string; content: string;
    targetRole: "ALL" | "CUSTOMER" | "DRIVER";
    priority: number; startsAt?: string; endsAt?: string;
  }) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("announcements")
      .insert({
        title: input.title,
        content: input.content,
        target_role: input.targetRole,
        priority: input.priority,
        starts_at: input.startsAt ?? new Date().toISOString(),
        ends_at: input.endsAt ?? null,
        status: "ACTIVE",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async setStatus(id: string, status: "ACTIVE" | "INACTIVE") {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("announcements").update({ status }).eq("id", id);
    if (error) throw error;
  },

  async softDelete(id: string) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("announcements")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async getActiveFor(role: "CUSTOMER" | "DRIVER") {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("status", "ACTIVE")
      .in("target_role", ["ALL", role])
      .lte("starts_at", now)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .is("deleted_at", null)
      .order("priority", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};
