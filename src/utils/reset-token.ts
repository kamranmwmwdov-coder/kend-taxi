import { randomBytes, createHash } from "crypto";

// İstifadəçiyə göndərilən açıq token 32 baytlıq təsadüfi dəyərdir.
// Verilənlər bazasında YALNIZ hash saxlanılır ki, DB sızsa belə token işə yaramasın.
export function generateResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(token);
  return { token, tokenHash };
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}
