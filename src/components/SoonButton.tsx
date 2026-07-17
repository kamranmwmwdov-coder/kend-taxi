"use client";

interface SoonButtonProps {
  message: string;
  className?: string;
  children: React.ReactNode;
}

export function SoonButton({ message, className, children }: SoonButtonProps) {
  return (
    <button type="button" onClick={() => alert(message)} className={className}>
      {children}
    </button>
  );
}
