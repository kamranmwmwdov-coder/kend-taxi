import { getSession } from "@/utils/session";
import type { SessionUser } from "@/types";

export async function requireCustomer(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") {
    const err: any = new Error("Giriş tələb olunur");
    err.status = 401;
    throw err;
  }
  return session;
}

export async function requireDriver(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") {
    const err: any = new Error("Giriş tələb olunur");
    err.status = 401;
    throw err;
  }
  return session;
}
