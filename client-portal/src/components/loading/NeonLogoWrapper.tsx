"use client";

import type { PropsWithChildren } from "react";
import clsx from "clsx";

type NeonLogoWrapperProps = PropsWithChildren<{
  show?: boolean;
  className?: string;
  durationIn?: number;
  /** Reserved for callers that manage exit animation at the parent level. */
  durationOut?: number;
}>;

export function NeonLogoWrapper({
  show = true,
  children,
  className,
  durationIn = 0.5,
}: NeonLogoWrapperProps) {
  if (!show) return null;

  return (
    <div
      className={clsx("neon-glow", className)}
      style={{
        animation: `fade-scale-in ${durationIn}s ease-out forwards, neon-pulse 1.5s ease-in-out infinite`,
      }}
    >
      {children}
    </div>
  );
}

