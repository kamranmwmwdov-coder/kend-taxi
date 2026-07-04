import { authService } from "@/modules/auth/auth.service";
import { getSession } from "@/utils/session";
import { ok } from "@/utils/api-response";

export async function POST() {
  const session = await getSession();
  await authService.logout(session?.id);
  return ok(null, "Çıxış edildi");
}
