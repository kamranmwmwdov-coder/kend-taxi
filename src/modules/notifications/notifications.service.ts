import { getSupabaseAdmin } from "@/utils/supabase-admin";

export const notificationsService = {
  async create(userId: string, title: string, message: string, type: string) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("notifications").insert({ user_id: userId, title, message, type });
    } catch (err) {
      // Bildiriş yazılması əsas əməliyyatı dayandırmamalıdır
      console.error("Bildiriş xətası:", err);
    }
  },

  async list(userId: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },

  async unreadCount(userId: string) {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) throw error;
    return count ?? 0;
  },

  async markRead(userId: string, notificationId?: string) {
    const supabase = getSupabaseAdmin();
    let query = supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);
    if (notificationId) query = query.eq("id", notificationId);
    else query = query.eq("is_read", false);
    const { error } = await query;
    if (error) throw error;
  },
};
