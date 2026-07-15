import { NextRequest } from "next/server";
import { getSession } from "@/utils/session";
import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { passwordResetRepository } from "@/modules/auth/password-reset.repository";
import { normalizeEmail, isValidEmail } from "@/utils/reset-token";
import { logAudit } from "@/modules/logs/logs.service";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Giriş tələb olunur", 401);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("users").select("email").eq("id", session.id).single();
  if (error) return fail("Xəta baş verdi.", 500);

  return ok({ email: data?.email ?? null });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Giriş tələb olunur", 401);

  const { email: rawEmail } = await req.json();
  const email = normalizeEmail(rawEmail || "");
  if (!isValidEmail(email)) return fail("Düzgün email daxil edin.", 422);

  const existing = await passwordResetRepository.findUserByEmail(email);
  if (existing && existing.id !== session.id) return fail("Bu email artıq istifadə olunur.", 409);

  await passwordResetRepository.setUserEmail(session.id, email);
  await logAudit({ userId: session.id, action: "UPDATE_EMAIL", module: "account" });

  return ok({ email }, "Email uğurla yadda saxlanıldı.");
}
