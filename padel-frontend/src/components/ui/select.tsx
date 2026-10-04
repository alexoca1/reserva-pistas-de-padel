import type { SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ children, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}