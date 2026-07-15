import { NextRequest } from "next/server";
import { passwordResetService, PasswordResetError } from "@/modules/auth/password-reset.service";
import { ok, fail } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    await passwordResetService.requestReset(email);
    // Qəsdən qeyri-spesifik: email mövcud olsun ya olmasın, eyni mesaj göstərilir
    return ok(null, "Əgər bu email qeydiyyatdadırsa, bərpa linki göndərildi.");
  } catch (err) {
    if (err instanceof PasswordResetError) return fail(err.message, err.status);
    console.error(err);
    return fail("Xəta baş verdi. Yenidən cəhd edin.", 500);
  }
}
