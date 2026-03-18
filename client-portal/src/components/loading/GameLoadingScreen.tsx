"use client";

import { LogoMark } from "@/src/components/branding/LogoMark";
import { NeonLogoWrapper } from "@/src/components/loading/NeonLogoWrapper";

type GameLoadingScreenProps = {
  gameName: string;
  tip?: string;
};

export function GameLoadingScreen({ gameName, tip }: GameLoadingScreenProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6">
      <NeonLogoWrapper>
        <LogoMark size="lg" />
      </NeonLogoWrapper>
      <div className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300/90">
          vAcAnt · Loading
        </p>
        <p className="text-lg font-semibold text-neutral-50">
          正在載入 {gameName} …
        </p>
        {tip && (
          <p className="text-xs text-neutral-400">
            {tip}
          </p>
        )}
      </div>
    </div>
  );
}

