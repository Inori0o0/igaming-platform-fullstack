"use client";

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/src/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  variant?: Variant;
  size?: Size;
};

const baseStyles =
  "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px";

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-cyan-500 text-black shadow-[0_0_18px_rgba(34,211,238,0.6)] hover:bg-cyan-400",
  secondary:
    "bg-neutral-900/80 text-cyan-100 border border-cyan-400/50 hover:bg-neutral-900 shadow-[0_0_14px_rgba(34,211,238,0.35)]",
  ghost:
    "bg-transparent text-cyan-100 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-400/40",
  outline:
    "bg-neutral-950/70 text-cyan-100 border border-cyan-500/80 hover:bg-cyan-500/5 shadow-[0_0_16px_rgba(34,211,238,0.5)]",
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

