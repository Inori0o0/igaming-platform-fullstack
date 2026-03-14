"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export function Input({
  label,
  error,
  helperText,
  leftSlot,
  rightSlot,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="flex w-full flex-col gap-1.5 text-sm text-neutral-200">
      {label && (
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-300/90">
          {label}
        </span>
      )}
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-neutral-950/80 px-3 py-2 shadow-[0_0_24px_rgba(24,24,27,0.9)] backdrop-blur-sm",
          error
            ? "border-rose-500/70 focus-within:border-rose-400"
            : "border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_24px_rgba(34,211,238,0.5)]",
        )}
      >
        {leftSlot && (
          <span className="flex items-center text-xs text-neutral-400">
            {leftSlot}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            "flex-1 bg-transparent text-sm text-neutral-50 placeholder:text-neutral-500 focus:outline-none",
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <span className="flex items-center text-xs text-neutral-400">
            {rightSlot}
          </span>
        )}
      </div>
      {(helperText || error) && (
        <p
          className={cn(
            "min-h-5 text-xs",
            error ? "text-rose-300" : "text-neutral-400",
          )}
        >
          {error ?? helperText}
        </p>
      )}
    </label>
  );
}

