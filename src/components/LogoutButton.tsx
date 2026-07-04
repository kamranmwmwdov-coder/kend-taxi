"use client";
import { useRouter } from "next/navigation";
import { Button } from "./Button";

export function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }
  return <Button variant="secondary" onClick={handleLogout}>Çıxış et</Button>;
}
