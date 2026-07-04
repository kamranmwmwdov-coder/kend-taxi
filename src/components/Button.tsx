"use client";
import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

export function Button({ variant = "primary", loading, children, className, disabled, ...rest }: Props) {
  const base = "w-full min-h-[52px] rounded-xl font-semibold text-base transition-colors active:scale-[0.99]";
  const styles = {
    primary: "bg-primary text-white active:bg-primary-dark",
    secondary: "bg-white text-ink border border-gray-200 active:bg-gray-50",
    danger: "bg-danger text-white active:opacity-90",
  };
  return (
    <button
      className={clsx(base, styles[variant], (disabled || loading) && "opacity-50 cursor-not-allowed", className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Gözləyin..." : children}
    </button>
  );
}
