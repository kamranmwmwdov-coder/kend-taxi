import { getSession } from "@/utils/session";
import type { SessionUser } from "@/types";

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    const err = new Error("İcazəniz yoxdur");
    (err as any).status = 403;
    throw err;
  }
  return session;
}
