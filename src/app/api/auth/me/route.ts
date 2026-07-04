import { getSession } from "@/utils/session";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Giriş tələb olunur", 401);
  return ok(session);
}
