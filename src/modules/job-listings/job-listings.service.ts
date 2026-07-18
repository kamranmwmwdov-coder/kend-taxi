import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { notificationsService } from "@/modules/notifications/notifications.service";

export class JobListingError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const LISTING_LIFETIME_DAYS = 30;

const DELETE_REASONS = [
  "Söyüş və təhqir",
  "Spam",
  "Yanlış məlumat",
  "Təkrar elan",
  "Qaydalara uyğun deyil",
  "Digər",
] as const;

const SELECT_WITH_USER =
  "*, user:users!job_listings_user_id_fkey(id, first_name, last_name, phone)";

const REACTION_TYPES = ["LIKE", "DISLIKE", "FAVORITE"] as const;
type ReactionType = (typeof REACTION_TYPES)[number];

type MyReaction = { liked: boolean; disliked: boolean; favorited: boolean };

function emptyReaction(): MyReaction {
  return { liked: false, disliked: false, favorited: false };
}

async function attachMyReactions<T extends { id: string }>(listings: T[], userId: string) {
  const supabase = getSupabaseAdmin();
  const ids = listings.map((l) => l.id);
  const map = new Map<string, MyReaction>();
  if (ids.length) {
    const { data, error } = await supabase
      .from("job_listing_interactions")
      .select("listing_id, type")
      .eq("user_id", userId)
      .in("listing_id", ids)
      .in("type", REACTION_TYPES as unknown as string[]);
    if (error) throw error;
    for (const row of data ?? []) {
      const cur = map.get(row.listing_id) ?? emptyReaction();
      if (row.type === "LIKE") cur.liked = true;
      if (row.type === "DISLIKE") cur.disliked = true;
      if (row.type === "FAVORITE") cur.favorited = true;
      map.set(row.listing_id, cur);
    }
  }
  return listings.map((l) => ({ ...l, myReaction: map.get(l.id) ?? emptyReaction() }));
}

export const jobListingsService = {
  DELETE_REASONS,

  // ---------- MÜŞTƏRİ TƏRƏFİ ----------

  /** Aktiv, bitmə tarixi keçməmiş elanların axını. VIP-lər əvvəldə göstərilir. */
  async listActiveFeed(userId: string, offset: number, limit: number) {
    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("job_listings")
      .select(SELECT_WITH_USER)
      .eq("status", "ACTIVE")
      .is("deleted_at", null)
      .gt("expires_at", nowIso)
      .order("is_vip", { ascending: false })
      .order("is_urgent", { ascending: false })
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return attachMyReactions(data ?? [], userId);
  },

  /** Elan detalı + oxşar elanlar (eyni kateqoriya). */
  async getActiveDetail(id: string, userId: string) {
    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();
    const { data: listing, error } = await supabase
      .from("job_listings")
      .select(SELECT_WITH_USER)
      .eq("id", id)
      .eq("status", "ACTIVE")
      .is("deleted_at", null)
      .gt("expires_at", nowIso)
      .maybeSingle();
    if (error) throw error;
    if (!listing) throw new JobListingError("Elan tapılmadı və ya artıq aktiv deyil.", 404);

    const { data: similarRaw, error: similarErr } = await supabase
      .from("job_listings")
      .select(SELECT_WITH_USER)
      .eq("status", "ACTIVE")
      .eq("category", listing.category)
      .neq("id", id)
      .is("deleted_at", null)
      .gt("expires_at", nowIso)
      .order("is_vip", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(6);
    if (similarErr) throw similarErr;

    const [withReaction] = await attachMyReactions([listing], userId);
    const similar = await attachMyReactions(similarRaw ?? [], userId);
    return { listing: withReaction, similar };
  },

  /** LIKE/DISLIKE/FAVORITE toggle edir. LIKE və DISLIKE bir-birini əvəz edir. */
  async react(listingId: string, userId: string, type: ReactionType) {
    if (!REACTION_TYPES.includes(type)) {
      throw new JobListingError("Reaksiya növü düzgün deyil.", 422);
    }
    const supabase = getSupabaseAdmin();

    const { data: existing, error: existingErr } = await supabase
      .from("job_listing_interactions")
      .select("id")
      .eq("listing_id", listingId)
      .eq("user_id", userId)
      .eq("type", type)
      .maybeSingle();
    if (existingErr) throw existingErr;

    if (existing) {
      const { error: delErr } = await supabase.from("job_listing_interactions").delete().eq("id", existing.id);
      if (delErr) throw delErr;
    } else {
      if (type === "LIKE" || type === "DISLIKE") {
        const opposite = type === "LIKE" ? "DISLIKE" : "LIKE";
        await supabase
          .from("job_listing_interactions")
          .delete()
          .eq("listing_id", listingId)
          .eq("user_id", userId)
          .eq("type", opposite);
      }
      const { error: insErr } = await supabase
        .from("job_listing_interactions")
        .insert({ listing_id: listingId, user_id: userId, type });
      if (insErr) throw insErr;
    }

    if (type === "LIKE" || type === "DISLIKE") {
      const [{ count: likesCount }, { count: dislikesCount }] = await Promise.all([
        supabase
          .from("job_listing_interactions")
          .select("id", { count: "exact", head: true })
          .eq("listing_id", listingId)
          .eq("type", "LIKE"),
        supabase
          .from("job_listing_interactions")
          .select("id", { count: "exact", head: true })
          .eq("listing_id", listingId)
          .eq("type", "DISLIKE"),
      ]);
      const { error: updErr } = await supabase
        .from("job_listings")
        .update({ likes_count: likesCount ?? 0, dislikes_count: dislikesCount ?? 0 })
        .eq("id", listingId);
      if (updErr) throw updErr;
    }

    const [withReaction] = await attachMyReactions([{ id: listingId }], userId);
    return withReaction.myReaction;
  },

  /** İstifadəçi başına 1 dəfə sayılan unikal baxış. */
  async recordView(listingId: string, userId: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("job_listing_interactions")
      .upsert(
        { listing_id: listingId, user_id: userId, type: "VIEW" },
        { onConflict: "listing_id,user_id,type", ignoreDuplicates: true }
      )
      .select("id");
    if (error) throw error;

    if (data && data.length > 0) {
      const { count } = await supabase
        .from("job_listing_interactions")
        .select("id", { count: "exact", head: true })
        .eq("listing_id", listingId)
        .eq("type", "VIEW");
      await supabase.from("job_listings").update({ views_count: count ?? 0 }).eq("id", listingId);
    }
  },

  /** Zəng/WhatsApp klik sayğacı (analitika üçün). */
  async recordContactClick(listingId: string, kind: "phone" | "whatsapp") {
    const supabase = getSupabaseAdmin();
    const column = kind === "phone" ? "phone_clicks" : "whatsapp_clicks";
    const { data: listing, error: fetchErr } = await supabase
      .from("job_listings")
      .select(column)
      .eq("id", listingId)
      .single();
    if (fetchErr) throw fetchErr;
    const current = (listing as Record<string, number>)?.[column] ?? 0;
    const { error } = await supabase
      .from("job_listings")
      .update({ [column]: current + 1 })
      .eq("id", listingId);
    if (error) throw error;
  },

  // ---------- ADMIN TƏRƏFİ ----------

  async listByStatus(status: "PENDING" | "ACTIVE") {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("job_listings")
      .select(SELECT_WITH_USER)
      .eq("status", status)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("job_listings")
      .select(SELECT_WITH_USER)
      .eq("id", id)
      .is("deleted_at", null)
      .single();
    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    input: {
      title?: string;
      category?: string;
      contactPhone?: string;
      whatsappPhone?: string | null;
      images?: string[];
      price?: number | null;
      eventDate?: string | null;
      eventTime?: string | null;
      address?: string;
      description?: string | null;
    }
  ) {
    if (input.title !== undefined && !input.title.trim()) {
      throw new JobListingError("İş adı boş ola bilməz.", 422);
    }
    if (input.address !== undefined && !input.address.trim()) {
      throw new JobListingError("Ünvan boş ola bilməz.", 422);
    }

    const supabase = getSupabaseAdmin();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.title !== undefined) patch.title = input.title;
    if (input.category !== undefined) patch.category = input.category;
    if (input.contactPhone !== undefined) patch.contact_phone = input.contactPhone;
    if (input.whatsappPhone !== undefined) patch.whatsapp_phone = input.whatsappPhone;
    if (input.images !== undefined) patch.images = input.images;
    if (input.price !== undefined) patch.price = input.price;
    if (input.eventDate !== undefined) patch.event_date = input.eventDate;
    if (input.eventTime !== undefined) patch.event_time = input.eventTime;
    if (input.address !== undefined) patch.address = input.address;
    if (input.description !== undefined) patch.description = input.description;

    const { data, error } = await supabase
      .from("job_listings")
      .update(patch)
      .eq("id", id)
      .select(SELECT_WITH_USER)
      .single();
    if (error) throw error;
    return data;
  },

  async approve(id: string) {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LISTING_LIFETIME_DAYS * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("job_listings")
      .update({
        status: "ACTIVE",
        published_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", id)
      .eq("status", "PENDING")
      .select(SELECT_WITH_USER)
      .single();
    if (error) throw error;
    if (!data) throw new JobListingError("Elan tapılmadı və ya artıq təsdiqlənib.", 404);
    return data;
  },

  async removeWithReason(id: string, reason: string, note?: string) {
    if (!DELETE_REASONS.includes(reason as (typeof DELETE_REASONS)[number])) {
      throw new JobListingError("Silmə səbəbi düzgün deyil.", 422);
    }
    if (reason === "Digər" && !note?.trim()) {
      throw new JobListingError("\"Digər\" seçildikdə izah yazılmalıdır.", 422);
    }

    const supabase = getSupabaseAdmin();
    const { data: listing, error: fetchErr } = await supabase
      .from("job_listings")
      .select("id, user_id, title")
      .eq("id", id)
      .single();
    if (fetchErr) throw fetchErr;
    if (!listing) throw new JobListingError("Elan tapılmadı.", 404);

    const { error } = await supabase
      .from("job_listings")
      .update({
        status: "REJECTED",
        rejection_reason: reason,
        rejection_note: note ?? null,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;

    await notificationsService.create(
      listing.user_id,
      "Elanınız yoxlanıldı",
      `Elanınız moderator tərəfindən yoxlanıldı və paylaşılmadı. Səbəb: ${reason}${note ? ` (${note})` : ""}`,
      "JOB_LISTING_REJECTED"
    );
  },

  async dashboardCounts() {
    const supabase = getSupabaseAdmin();
    const [pending, active, total] = await Promise.all([
      supabase.from("job_listings").select("id", { count: "exact", head: true }).eq("status", "PENDING").is("deleted_at", null),
      supabase.from("job_listings").select("id", { count: "exact", head: true }).eq("status", "ACTIVE").is("deleted_at", null),
      supabase.from("job_listings").select("id", { count: "exact", head: true }).is("deleted_at", null),
    ]);
    if (pending.error) throw pending.error;
    if (active.error) throw active.error;
    if (total.error) throw total.error;
    return {
      pendingJobListingCount: pending.count ?? 0,
      activeJobListingCount: active.count ?? 0,
      totalJobListingCount: total.count ?? 0,
    };
  },
};
