"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { SplashScreen } from "@/src/components/loading/SplashScreen";

const BaccaratTable = dynamic(
  () =>
    import("@/src/games/baccarat/components/BaccaratTable").then(
      (mod) => ({ default: mod.BaccaratTable }),
    ),
  { ssr: false },
);

export function BaccaratTableClient() {
  const [isReady, setIsReady] = useState(false);
  const handleReady = useCallback(() => setIsReady(true), []);

  return (
    <>
      <SplashScreen show={!isReady} mode="fullscreen" minVisibleMs={400} />
      <BaccaratTable onReady={handleReady} />
    </>
  );
}
