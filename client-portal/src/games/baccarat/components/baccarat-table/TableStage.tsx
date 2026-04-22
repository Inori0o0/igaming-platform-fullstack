"use client";

/**
 * 牌桌視覺：背景、吉祥物層、莊上閒下牌列。
 * 依 `round.revealed` 決定每張牌顯示正面或牌背；結算後可延遲全部蓋回牌背（純顯示）。
 */
import clsx from "clsx";
import { useEffect, useState } from "react";
import { BACCARAT_ASSETS } from "./constants";
import { MascotLayer } from "./MascotLayer";
import { SideSection } from "./SideSection";
import type { BaccaratRoundState } from "./types";

type TableStageProps = {
  round: BaccaratRoundState | null;
};

export function TableStage({ round }: TableStageProps) {
  const [hideCardsAfterSettle, setHideCardsAfterSettle] = useState(false);
  const cardMotionY = 6;

  const settled = round?.phase === "settled" && Boolean(round.outcome);
  const outcome = settled ? round!.outcome : null;

  const isTie = outcome === "tie";
  const tralaleroFace =
    !settled || isTie
      ? "idle"
      : outcome === "player"
        ? "win"
        : "lose";
  const liriliFace =
    !settled || isTie
      ? "idle"
      : outcome === "banker"
        ? "win"
        : "lose";

  const wager = round?.wager ?? 0;
  const payout = round?.payout ?? 0;
  const netPositive = settled && payout > wager;
  const shouldShowTung = settled && (netPositive || isTie);
  const tungFace = netPositive ? "win" : "tie";

  useEffect(() => {
    // New round or not settled: always show cards.
    if (!round || round.phase !== "settled") {
      queueMicrotask(() => {
        setHideCardsAfterSettle(false);
      });
      return;
    }
    queueMicrotask(() => {
      setHideCardsAfterSettle(false);
    });
    const id = window.setTimeout(() => {
      setHideCardsAfterSettle(true);
    }, 3000);
    return () => window.clearTimeout(id);
  }, [round]);

  return (
    <div
      className={clsx(
        "relative isolate z-0 min-h-[300px] overflow-visible rounded-3xl bg-neutral-950/70 p-3 shadow-[0_0_60px_rgba(34,211,238,0.16)]",
        "sm:min-h-[330px] lg:min-h-[360px]",
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: `url(${BACCARAT_ASSETS.tableBackground})` }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/45 to-black/70" />
      </div>

      <MascotLayer
        tralaleroMood={tralaleroFace}
        liriliMood={liriliFace}
        showTung={shouldShowTung}
        tungFace={tungFace}
      />

      <div className="relative z-10 pb-2 sm:pb-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Baccarat Table</p>
          <span className="text-[11px] text-neutral-500">
            {round?.phase === "settled" && round.outcome ? `結果：${round.outcome}` : "player / banker / tie"}
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          <SideSection
            cards={round?.bankerCards ?? []}
            accent="banker"
            label="Banker（莊）"
            hideCards={hideCardsAfterSettle}
            revealedCount={round?.revealed.banker ?? 0}
            cardMotionY={cardMotionY}
          />
          <SideSection
            cards={round?.playerCards ?? []}
            accent="player"
            label="Player（閒）"
            hideCards={hideCardsAfterSettle}
            revealedCount={round?.revealed.player ?? 0}
            cardMotionY={cardMotionY}
          />
        </div>
      </div>
    </div>
  );
}

