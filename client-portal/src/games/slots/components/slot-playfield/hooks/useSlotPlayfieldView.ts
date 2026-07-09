"use client";

import type { CSSProperties } from "react";
import type { SlotThemeConfig } from "@/src/games/slots/config";

type UseSlotPlayfieldViewArgs = {
  theme: SlotThemeConfig;
  reduceMotion: boolean;
};

export function useSlotPlayfieldView({
  theme,
  reduceMotion,
}: UseSlotPlayfieldViewArgs) {
  const v = theme.visual;
  const pageBg = v.pageBackgroundSrc;
  const frameSrc = v.machineFrameSrc;
  const bannerSrc = v.titleBannerSrc;
  const shellOverArt = Boolean(pageBg || bannerSrc || frameSrc);

  const glitchStyle: CSSProperties | undefined =
    v.glitchIntensity > 0 && !reduceMotion
      ? {
          filter: `drop-shadow(0 0 ${6 + v.glitchIntensity * 10}px rgba(236, 72, 153, 0.45))`,
        }
      : undefined;

  return {
    v,
    pageBg,
    frameSrc,
    bannerSrc,
    shellOverArt,
    glitchStyle,
  };
}
