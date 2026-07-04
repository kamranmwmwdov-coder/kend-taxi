import { NextRequest } from "next/server";
import { authService, AuthError } from "@/modules/auth/auth.service";
import { ok, fail } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, password, passwordConfirm } = body;

    if (password !== passwordConfirm) {
      return fail("Şifrələr uyğun gəlmir", 422, { passwordConfirm: "Şifrələr uyğun gəlmir" });
    }

    const user = await authService.register({ firstName, lastName, phone, password });
    return ok(user, "Qeydiyyat uğurla tamamlandı");
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message, err.status);
    console.error(err);
    return fail("Server xətası baş verdi", 500);
  }
}
