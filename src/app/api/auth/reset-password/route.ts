import { NextRequest } from "next/server";
import { passwordResetService, PasswordResetError } from "@/modules/auth/password-reset.service";
import { ok, fail } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword, newPasswordConfirm } = await req.json();
    if (newPassword !== newPasswordConfirm) return fail("Şifrələr uyğun gəlmir.", 422);

    await passwordResetService.confirmReset(token, newPassword);
    return ok(null, "Şifrə uğurla yeniləndi. İndi daxil ola bilərsiniz.");
  } catch (err) {
    if (err instanceof PasswordResetError) return fail(err.message, err.status);
    console.error(err);
    return fail("Xəta baş verdi. Yenidən cəhd edin.", 500);
  }
}
