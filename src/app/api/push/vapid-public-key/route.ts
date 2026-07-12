import { getSession } from "@/utils/session";
import { fail, ok } from "@/utils/api-response";
import { getVapidPublicKey } from "@/utils/push";

export async function GET() {
  if (!(await getSession())) return fail("Login required", 401);
  try {
    return ok({ publicKey: getVapidPublicKey() });
  } catch {
    return fail("Push configuration is not ready", 503);
  }
}
