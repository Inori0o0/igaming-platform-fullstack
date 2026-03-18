"use client";

import { LogoMark } from "@/src/components/branding/LogoMark";
import { NeonLogoWrapper } from "@/src/components/loading/NeonLogoWrapper";

type SplashScreenViewProps = {
  /** 是否顯示（純 UI 元件；不處理 minVisibleMs） */
  visible: boolean;
  /** 全螢幕或只覆蓋所在容器 */
  mode?: "fullscreen" | "inline";
};

/**
 * SplashScreen 的純 UI 呈現元件。
 *
 * 白話：只負責「畫面長什麼樣」，不負責「什麼時候顯示/什麼時候關閉」。
 */
export function SplashScreenView({
  visible,
  mode = "fullscreen",
}: SplashScreenViewProps) {
  if (!visible) return null;

  const positionClass = mode === "inline" ? "absolute inset-0" : "fixed inset-0";

  return (
    <div
      className={`${positionClass} z-40 flex items-center justify-center bg-[#03030a] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_60%)]`}
    >
      <div className="flex flex-col items-center gap-6">
        <NeonLogoWrapper>
          <LogoMark size="xl" />
        </NeonLogoWrapper>
        <div className="w-56 max-w-[70vw]">
          <p className="text-center text-[11px] uppercase tracking-[0.24em] text-cyan-200/80">
            vAcAnt · Italian Brainrot Casino
          </p>
          <p className="mt-1 text-center text-xs text-neutral-300/85">
            正在準備你的虛擬賭場大廳…
          </p>
        </div>
      </div>
    </div>
  );
}

