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

export const jobListingsService = {
  DELETE_REASONS,

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
