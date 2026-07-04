import { NextRequest } from "next/server";
import { authService, AuthError } from "@/modules/auth/auth.service";
import { ok, fail } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) return fail("Telefon və şifrə tələb olunur", 422);

    const user = await authService.login(phone, password);
    return ok(user, "Giriş uğurludur");
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message, err.status);
    console.error(err);
    return fail("Server xətası baş verdi", 500);
  }
}
