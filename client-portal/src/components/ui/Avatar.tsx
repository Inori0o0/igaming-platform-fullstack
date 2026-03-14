"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/src/lib/cn";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  className?: string;
} & Omit<ImageProps, "src" | "alt" | "width" | "height" | "fill">;
// 使用 Omit 來移除 ImageProps 中不需要的 props

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className,
  ...imgProps
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const showImage = src && !hasError;

  // 從 fallback 字串取前兩段的首字大寫當縮寫，沒有則顯示 "?"
  const initials =
    fallback
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "?";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full border border-cyan-400/60 bg-neutral-950/80 shadow-[0_0_20px_rgba(34,211,238,0.5)]",
        "overflow-hidden",
        sizeStyles[size],
        className,
      )}
    >
      {showImage ? (
        <Image
          src={src ?? ""}
          alt={alt ?? fallback ?? "Avatar"}
          fill
          sizes={size === "sm" ? "32px" : size === "md" ? "40px" : "48px"}
          className="object-cover"
          onError={() => setHasError(true)}
          {...imgProps}
        />
      ) : (
        <span className="select-none font-semibold tracking-wide text-cyan-100">
          {initials}
        </span>
      )}
    </div>
  );
}
