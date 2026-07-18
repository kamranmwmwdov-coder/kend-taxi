"use client";
import { formatPhoneMask } from "@/utils/phone";

interface Props {
  value: string;
  onChange: (raw: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export function PhoneInput({ value, onChange, error, label = "Telefon nömrəsi", required }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-muted mb-1">{label}</label>
      <input
        type="tel"
        inputMode="numeric"
        placeholder="050 XXX XX XX"
        className="input-field"
        value={formatPhoneMask(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        maxLength={13}
        required={required}
      />
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
}
