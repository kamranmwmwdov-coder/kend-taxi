"use client";
import { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
}

export function Checkbox({ label, checked, className, ...rest }: Props) {
  return (
    <label className={clsx("flex items-start gap-3 cursor-pointer select-none", className)}>
      <span
        className={clsx(
          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors",
          checked ? "bg-primary border-primary" : "bg-white border-gray-300"
        )}
      >
        {checked && <Check size={14} className="text-white" strokeWidth={3} />}
      </span>
      <input type="checkbox" checked={checked} className="sr-only" {...rest} />
      <span className="text-sm text-ink leading-snug">{label}</span>
    </label>
  );
}
