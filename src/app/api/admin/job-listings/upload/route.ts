import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { ok, fail } from "@/utils/api-response";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return fail("Şəkil seçilməyib.", 422);

    if (!ALLOWED_TYPES.includes(file.type)) {
      return fail("Yalnız PNG, JPG, JPEG, WEBP formatları qəbul edilir.", 422);
    }
    if (file.size > MAX_SIZE_BYTES) {
      return fail("Şəkil ölçüsü 5MB-dan böyük ola bilməz.", 422);
    }

    const supabase = getSupabaseAdmin();
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from("job-listings").upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from("job-listings").getPublicUrl(path);
    return ok({ url: publicUrlData.publicUrl }, "Şəkil yükləndi");
  } catch (err: any) {
    return fail(err.message ?? "Yükləmə xətası baş verdi", err.status ?? 500);
  }
}
