"use client";
import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, type, ...rest }: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="block text-sm font-medium text-ink-muted mb-1">{label}</label>
      <div className="relative">
        <input
          type={isPassword && show ? "text" : type}
          className="input-field pr-12"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
            aria-label="Şifrəni göstər/gizlət"
          >
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
}
