"use client";

/** 玩家手牌（可多分牌）：顯示點數、作用中手、結算標籤。 */
import clsx from "clsx";
import { motion } from "framer-motion";
import { handValue } from "@/src/games/blackjack/logic/game";
import { cardLabel, tierGroup, tierLabel } from "./helpers";
import type { RoundState } from "./types";

type PlayerHandsSectionProps = {
  round: RoundState | null;
};

export function PlayerHandsSection({ round }: PlayerHandsSectionProps) {
  return (
    <div className="mt-5 space-y-3 sm:mt-6">
      {(round?.hands ?? []).map((hand, index) => {
        const total = handValue(hand.cards).total;
        const isActive = round?.activeHandIndex === index && round.phase === "player_turn";
        const settlement = round?.settled.find((s) => s.handId === hand.id);
        return (
          <div key={hand.id} className="px-1 py-1">
            <div className="flex min-h-12 flex-wrap justify-center gap-2 sm:min-h-14">
              {hand.cards.map((card, cardIdx) => (
                <motion.div
                  key={`${hand.id}-${card.rank}-${card.suit}-${cardIdx}`}
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18, delay: cardIdx * 0.04 }}
                  className="relative flex aspect-2/3 w-10 items-center justify-center overflow-hidden rounded-md border border-cyan-500/40 bg-neutral-900 text-sm font-semibold text-cyan-100 sm:w-11 md:w-12 lg:w-14 xl:w-16"
                >
                  {cardLabel(card)}
                </motion.div>
              ))}
            </div>
            <div className="mt-1.5 flex items-center justify-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-300">
                Player Hand {index + 1}
              </p>
              <span
                className={clsx(
                  "rounded-full border px-2 py-0.5 text-[10px]",
                  isActive
                    ? "border-cyan-300/60 bg-cyan-500/10 text-cyan-100"
                    : "border-cyan-500/30 bg-cyan-500/5 text-cyan-200",
                )}
              >
                total {total} / bet {hand.wager}
              </span>
            </div>
            {settlement ? (
              <p className="mt-1 text-center text-[11px] text-neutral-300">
                結果：{settlement.outcome}（net {settlement.net >= 0 ? "+" : ""}
                {settlement.net}）
                {tierGroup(settlement.handTier) !== "normal" ? (
                  <span
                    className={clsx(
                      "ml-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      tierGroup(settlement.handTier) === "five-cards"
                        ? "border-emerald-300/70 bg-emerald-500/15 text-emerald-100"
                        : "border-amber-300/70 bg-amber-500/15 text-amber-100",
                    )}
                  >
                    {tierLabel(settlement.handTier)}
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
