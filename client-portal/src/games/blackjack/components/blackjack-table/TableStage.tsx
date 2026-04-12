"use client";

/**
 * 牌桌視覺區：背景、吉祥物層、莊家與玩家手牌區（不含右側控制列）。
 */
import clsx from "clsx";
import { useIsCompactTableViewport } from "@/src/games/useCompactTableViewport";
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
  const compact = useIsCompactTableViewport();
  const handCount = round?.hands.length ?? 0;
  const splitScroll = compact && handCount > 1;
  const cardMotionY = compact ? 0 : 6;

  return (
    <div
      className={clsx(
        "relative h-full min-h-[260px] overflow-visible rounded-3xl border border-cyan-500/30 bg-neutral-950/70 p-3 shadow-[0_0_60px_rgba(34,211,238,0.16)] sm:min-h-[300px]",
        compact && "min-h-[320px] sm:min-h-[350px]",
      )}
    >
      {/* 背景裁切在圓角內；外層 overflow-visible 讓吉祥物可超出桌緣 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${BLACKJACK_ASSETS.tableBackground})` }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/45 to-black/70" />
      </div>

      <MascotLayer
        dealerMood={dealerMood}
        brrTriggered={brrTriggered}
        bombardiroTriggered={bombardiroTriggered}
      />

      <div className="relative z-10 pb-2 sm:pb-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Tung Tung Tung Sahur Table
          </p>
          <span className="text-[11px] text-neutral-500">dealer total: {dealerTotal}</span>
        </div>
        <DealerSection round={round} cardMotionY={cardMotionY} />
        <div
          className={clsx(
            compact && "min-h-[128px]",
            splitScroll &&
              "max-h-[min(48dvh,420px)] overflow-y-auto overscroll-y-contain pr-1 [-webkit-overflow-scrolling:touch]",
          )}
        >
          <PlayerHandsSection round={round} cardMotionY={cardMotionY} />
        </div>
      </div>
    </div>
  );
}
