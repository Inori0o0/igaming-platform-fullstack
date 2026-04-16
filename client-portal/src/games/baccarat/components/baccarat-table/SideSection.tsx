"use client";

import clsx from "clsx";
import { baccaratTotal } from "@/src/games/baccarat/logic/game";
import type { BaccaratRoundState } from "./types";
import { CardCell } from "./CardCell";

type SideSectionProps = {
  cards: BaccaratRoundState["playerCards"];
  accent: "player" | "banker";
  label: string;
  hideCards: boolean;
  revealedCount: number;
  cardMotionY: number;
};

export function SideSection(props: SideSectionProps) {
  const { cards, accent, label, hideCards, revealedCount, cardMotionY } = props;

  // 僅用「已翻開」的牌計點，避免在未翻牌或補牌前洩漏即將出現的 total。
  const visibleCards = hideCards ? [] : cards.slice(0, Math.min(revealedCount, cards.length));
  const total = visibleCards.length ? baccaratTotal(visibleCards) : 0;
  const showTotal = visibleCards.length > 0;
  const hideCount = cards.length > 0 ? cards.length : 2;

  return (
    <div className="rounded-2xl bg-black/15 px-2 py-2 sm:px-3">
      <div className="flex min-h-[24px] items-center justify-between gap-3">
        <p
          className={clsx(
            "text-[11px] font-semibold uppercase tracking-[0.14em]",
            accent === "player" ? "text-cyan-100/90" : "text-rose-100/90",
          )}
        >
          {label}
        </p>
        {showTotal ? (
          <span
            className={clsx(
              "rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold",
              accent === "player" ? "text-cyan-100" : "text-rose-100",
            )}
          >
            total {total}
          </span>
        ) : (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold opacity-0">
            total 0
          </span>
        )}
      </div>

      <div
        className={clsx(
          "mt-2 flex min-h-[88px] flex-wrap content-start items-start justify-center gap-2",
          "sm:min-h-[96px] lg:min-h-[112px] xl:min-h-[128px]",
        )}
      >
        {hideCards ? (
          Array.from({ length: hideCount }).map((_, idx) => (
            <CardCell
              key={`hidden-${label}-${idx}`}
              hidden
              index={idx}
              accent={accent}
              cardMotionY={cardMotionY}
            />
          ))
        ) : cards.length > 0 ? (
          cards.map((c, idx) => (
            <CardCell
              key={`${c.rank}-${c.suit}-${idx}`}
              hidden={idx >= revealedCount}
              card={c}
              index={idx}
              accent={accent}
              cardMotionY={cardMotionY}
            />
          ))
        ) : (
          <>
            <CardCell hidden index={0} accent={accent} cardMotionY={cardMotionY} />
            <CardCell hidden index={1} accent={accent} cardMotionY={cardMotionY} />
          </>
        )}
      </div>
    </div>
  );
}
