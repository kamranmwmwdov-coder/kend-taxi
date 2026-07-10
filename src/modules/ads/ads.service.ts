import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { azerbaijanDateTimeLocalToUtcIso, nowUtcIso } from "@/utils/azerbaijan-time";

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
    backgroundColor?: string; textColor?: string; textStyle?: string; lentColor?: string;
    displayDurationSeconds?: number;
    priority: number; targetRole: "ALL" | "CUSTOMER" | "DRIVER";
    startsAt: string; endsAt: string;
  }) {
    const supabase = getSupabaseAdmin();
    const startsAt = azerbaijanDateTimeLocalToUtcIso(input.startsAt);
    const endsAt = azerbaijanDateTimeLocalToUtcIso(input.endsAt);

    if (new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
      throw new Error("Advertisement end date must be after start date");
    }
    const displayDurationSeconds = typeof input.displayDurationSeconds === "number" && Number.isFinite(input.displayDurationSeconds)
      ? Math.max(1, Math.min(3600, Math.round(input.displayDurationSeconds!)))
      : 5;

    const { data, error } = await supabase
      .from("advertisements")
      .insert({
        title: input.title,
        description: input.description ?? null,
        image_url: input.imageUrl ?? null,
        link_url: input.linkUrl ?? null,
        background_color: input.backgroundColor ?? "#EEF2F7",
        text_color: input.textColor ?? "#1F2430",
        text_style: input.textStyle ?? "font-semibold",
        lent_color: input.lentColor ?? "#1D6FE0",
        display_duration_seconds: displayDurationSeconds,
        priority: input.priority,
        target_role: input.targetRole,
        starts_at: startsAt,
        ends_at: endsAt,
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
  async getActiveAds(targetRole: "ALL" | "CUSTOMER" | "DRIVER" = "ALL") {
    const supabase = getSupabaseAdmin();
    const now = nowUtcIso();
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .eq("status", "ACTIVE")
      .in("target_role", targetRole === "ALL" ? ["ALL"] : ["ALL", targetRole])
      .lte("starts_at", now)
      .gte("ends_at", now)
      .is("deleted_at", null)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async registerClick(id: string) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("advertisements").select("clicks").eq("id", id).single();
    await supabase.from("advertisements").update({ clicks: (data?.clicks ?? 0) + 1 }).eq("id", id);
  },
};
