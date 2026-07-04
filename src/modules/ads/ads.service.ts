import { getSupabaseAdmin } from "@/utils/supabase-admin";

export const adsService = {
  async listAll() {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(input: {
    title: string; description?: string; imageUrl?: string; linkUrl?: string;
    priority: number; targetRole: "ALL" | "CUSTOMER" | "DRIVER";
    startsAt: string; endsAt: string;
  }) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("advertisements")
      .insert({
        title: input.title,
        description: input.description ?? null,
        image_url: input.imageUrl ?? null,
        link_url: input.linkUrl ?? null,
        priority: input.priority,
        target_role: input.targetRole,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        status: "ACTIVE",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async setStatus(id: string, status: "ACTIVE" | "INACTIVE") {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("advertisements").update({ status }).eq("id", id);
    if (error) throw error;
  },

  async softDelete(id: string) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("advertisements")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  // Giriş səhifəsində göstəriləcək aktiv reklamı tapır (prioritet + tarix aralığı)
  async getActiveAd(targetRole: "ALL" | "CUSTOMER" | "DRIVER" = "ALL") {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .eq("status", "ACTIVE")
      .in("target_role", targetRole === "ALL" ? ["ALL"] : ["ALL", targetRole])
      .lte("starts_at", now)
      .gte("ends_at", now)
      .is("deleted_at", null)
      .order("priority", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      await supabase.from("advertisements").update({ impressions: (data.impressions ?? 0) + 1 }).eq("id", data.id);
    }
    return data;
  },

  async registerClick(id: string) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("advertisements").select("clicks").eq("id", id).single();
    await supabase.from("advertisements").update({ clicks: (data?.clicks ?? 0) + 1 }).eq("id", id);
  },
};
