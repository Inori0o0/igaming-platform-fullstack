"use client";

import { useSplashVisibility } from "@/src/components/loading/useSplashVisibility";
import { SplashScreenView } from "@/src/components/loading/SplashScreenView";

type SplashScreenProps = {
  show?: boolean;
  minVisibleMs?: number;
  mode?: "fullscreen" | "inline";
};

export function SplashScreen({
  show = false,
  minVisibleMs = 600,
  mode = "fullscreen",
}: SplashScreenProps) {
  // `SplashScreen` 是可以在任何 page 單獨使用的元件：
  // - 你決定 `show` 何時為 true（例如 initAuth、手動切換、或頁面載入）
  // - 內部幫你處理「立刻可見」與「最短顯示 minVisibleMs」的細節
  const visible = useSplashVisibility({
    show,
    minVisibleMs,
  });

  return <SplashScreenView visible={visible} mode={mode} />;
}

