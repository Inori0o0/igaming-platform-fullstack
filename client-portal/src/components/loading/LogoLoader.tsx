"use client";

import clsx from "clsx";
import { LogoMark } from "@/src/components/branding/LogoMark";

type LogoLoaderProps = {
  size?: "xs" | "sm" | "md";
  className?: string;
};

const sizeMap: Record<NonNullable<LogoLoaderProps["size"]>, "sm" | "md"> = {
  xs: "sm",
  sm: "sm",
  md: "md",
};

export function LogoLoader({ size = "sm", className }: LogoLoaderProps) {
  return (
    <div
      className={clsx("inline-flex items-center justify-center", className)}
      aria-label="載入中"
    >
      <div className="neon-glow animate-neon-pulse">
        <LogoMark size={sizeMap[size]} />
      </div>
    </div>
  );
}
