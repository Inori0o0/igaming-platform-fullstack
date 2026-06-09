"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { SplashScreen } from "@/src/components/loading/SplashScreen";

const BlackjackTable = dynamic(
  () =>
    import("@/src/games/blackjack/components/BlackjackTable").then(
      (mod) => ({ default: mod.BlackjackTable }),
    ),
  { ssr: false },
);

export function BlackjackTableClient() {
  const [isReady, setIsReady] = useState(false);
  const handleReady = useCallback(() => setIsReady(true), []);

  return (
    <>
      <SplashScreen show={!isReady} mode="fullscreen" minVisibleMs={400} />
      <BlackjackTable onReady={handleReady} />
    </>
  );
}
