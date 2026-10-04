import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "danger";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "border-white/10 bg-white/5 text-secondary-foreground",
  success: "border-primary/30 bg-primary/15 text-primary",
  danger: "border-destructive/30 bg-destructive/15 text-destructive",
};

export function Badge({ children, className = "", variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}