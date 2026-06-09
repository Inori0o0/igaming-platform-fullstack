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
        // "both" = backwards (apply `from` state immediately on mount, no
        // one-frame flash at natural opacity:1) + forwards (keep final state).
        animation: `fade-scale-in ${durationIn}s ease-out both, neon-pulse 1.5s ease-in-out infinite`,
      }}
    >
      {children}
    </div>
  );
}

