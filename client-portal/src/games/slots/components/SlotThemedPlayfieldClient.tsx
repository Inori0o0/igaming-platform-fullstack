"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { SplashScreen } from "@/src/components/loading/SplashScreen";
import type { SlotThemeConfig } from "@/src/games/slots/config";

const SlotThemedPlayfield = dynamic(
  () =>
    import("@/src/games/slots/components/SlotThemedPlayfield").then(
      (mod) => ({ default: mod.SlotThemedPlayfield }),
    ),
  { ssr: false },
);

export function SlotThemedPlayfieldClient({ theme }: { theme: SlotThemeConfig }) {
  const [isReady, setIsReady] = useState(false);
  const handleReady = useCallback(() => setIsReady(true), []);

  return (
    <>
      <SplashScreen show={!isReady} mode="fullscreen" minVisibleMs={400} />
      <SlotThemedPlayfield theme={theme} onReady={handleReady} />
    </>
  );
}
