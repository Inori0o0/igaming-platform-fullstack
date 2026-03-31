"use client";

import clsx from "clsx";
import type { CSSProperties, PropsWithChildren } from "react";
import type { SlotThemeConfig } from "@/src/games/slots/config";
import { SlotPlayfieldShellHeader } from "./SlotPlayfieldShellHeader";

type SlotPlayfieldShellProps = PropsWithChildren<{
  theme: SlotThemeConfig;
  hasBanner: boolean;
  shellOverArt: boolean;
  style?: CSSProperties;
}>;

export function SlotPlayfieldShell({
  theme,
  hasBanner,
  shellOverArt,
  style,
  children,
}: SlotPlayfieldShellProps) {
  return (
    <div
      className={clsx(
        "w-full rounded-3xl border p-4",
        shellOverArt
          ? "border-cyan-500/35 bg-black/40 backdrop-blur-sm"
          : clsx("bg-linear-to-br", theme.visual.shellBorder, theme.visual.shellGradient),
      )}
      style={style}
    >
      <SlotPlayfieldShellHeader theme={theme} hasBanner={hasBanner} />
      {children}
    </div>
  );
}
