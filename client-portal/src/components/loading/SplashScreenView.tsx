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

  const logo = (
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
  );

  if (mode === "inline") {
    // absolute inset-0：覆蓋所在容器（ClientLayoutShell <main>）
    // m-0：Tailwind v4 的 space-y-* 改用 margin-block-end，:where() 0 specificity；
    //   加 m-0 (specificity 0,1,0) 確保此 absolute/fixed 元素不被 space-y 位移。
    // min-h-full max-h-dvh：確保高度至少等於容器，但不超過視窗高度。
    return (
      <div className="absolute inset-0 z-40 m-0 bg-[#03030a] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_60%)]">
        <div className="flex min-h-full max-h-dvh items-center justify-center">
          {logo}
        </div>
      </div>
    );
  }

  // fullscreen：fixed inset-0 蓋住整個視窗，flex 直接在外層 div 置中。
  // m-0：Tailwind v4 space-y-* 用 :where(> :not(:last-child)) + margin-block-end；
  //   當遊戲元件渲染後 SplashScreen 不再是 last-child，margin-block-end 會把
  //   bottom:0 的 fixed 元素底部往上推，造成下方鏤空。m-0 覆蓋此偏移。
  return (
    <div className="fixed inset-0 z-40 m-0 flex items-center justify-center bg-[#03030a] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_60%)]">
      {logo}
    </div>
  );
}
