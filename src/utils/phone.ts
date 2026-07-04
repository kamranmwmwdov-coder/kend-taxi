// Qəbul edilən formatlar: 0501234567 və ya +994501234567
const RAW_AZ_PHONE_REGEX = /^(?:\+994|0)(10|50|51|55|60|70|77|99)\d{7}$/;

export function normalizePhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+994")) return digits;
  if (digits.startsWith("994")) return "+" + digits;
  if (digits.startsWith("0")) return "+994" + digits.slice(1);
  return digits;
}

export function isValidAzPhone(input: string): boolean {
  const normalized = normalizePhone(input);
  const local = normalized.startsWith("+994") ? "0" + normalized.slice(4) : normalized;
  return RAW_AZ_PHONE_REGEX.test(local) || RAW_AZ_PHONE_REGEX.test(normalized);
}

export function formatPhoneMask(input: string): string {
  // Görüntü üçün: 050 XXX XX XX
  const local = input.startsWith("+994") ? "0" + input.slice(4) : input;
  const d = local.replace(/\D/g, "").slice(0, 10);
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)].filter(Boolean);
  return parts.join(" ");
}
