import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/utils/session";
import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { logAudit } from "@/modules/logs/logs.service";
import { ok, fail } from "@/utils/api-response";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Giriş tələb olunur", 401);

  const { currentPassword, newPassword, newPasswordConfirm } = await req.json();

  if (!currentPassword || !newPassword) return fail("Bütün sahələr doldurulmalıdır.", 422);
  if (newPassword.length < 6) return fail("Yeni şifrə minimum 6 simvol olmalıdır.", 422);
  if (newPassword !== newPasswordConfirm) return fail("Şifrələr uyğun gəlmir.", 422);

  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase.from("users").select("password_hash").eq("id", session.id).single();
  if (error || !user) return fail("İstifadəçi tapılmadı.", 404);

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) return fail("Cari şifrə yanlışdır.", 401);

  const newHash = await bcrypt.hash(newPassword, 10);
  await supabase.from("users").update({ password_hash: newHash }).eq("id", session.id);
  await logAudit({ userId: session.id, action: "CHANGE_PASSWORD", module: "account" });

  return ok(null, "Şifrə uğurla dəyişdirildi");
}
