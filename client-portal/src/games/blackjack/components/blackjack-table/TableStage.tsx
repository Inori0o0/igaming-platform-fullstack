"use client";

/**
 * 牌桌視覺區：背景、吉祥物層、莊家與玩家手牌區（不含右側控制列）。
 */
import { BLACKJACK_ASSETS } from "./constants";
import { DealerSection } from "./DealerSection";
import { MascotLayer } from "./MascotLayer";
import { PlayerHandsSection } from "./PlayerHandsSection";
import type { RoundState } from "./types";

type TableStageProps = {
  round: RoundState | null;
  dealerTotal: number;
  dealerMood: "idle" | "win" | "lose";
  brrTriggered: boolean;
  bombardiroTriggered: boolean;
};

export function TableStage(props: TableStageProps) {
  const { round, dealerTotal, dealerMood, brrTriggered, bombardiroTriggered } = props;

  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-cyan-500/30 bg-neutral-950/70 p-3 shadow-[0_0_60px_rgba(34,211,238,0.16)] sm:min-h-[300px]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${BLACKJACK_ASSETS.tableBackground})` }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/35 via-black/45 to-black/70" />
      <MascotLayer
        dealerMood={dealerMood}
        brrTriggered={brrTriggered}
        bombardiroTriggered={bombardiroTriggered}
      />

      <div className="relative z-10 pb-8 sm:pb-10 md:pb-12 lg:pb-16 xl:pb-20">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Tung Tung Tung Sahur Table
          </p>
          <span className="text-[11px] text-neutral-500">dealer total: {dealerTotal}</span>
        </div>
        <DealerSection round={round} />
        <PlayerHandsSection round={round} />
      </div>
    </div>
  );
}
