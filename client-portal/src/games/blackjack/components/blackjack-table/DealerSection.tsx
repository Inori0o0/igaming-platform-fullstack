"use client";

/** 莊家牌列：首張隱牌時不顯示第二張。 */
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import { CHIP_CARD_ASSETS } from "./constants";
import { cardLabel } from "./helpers";
import type { RoundState } from "./types";

type DealerSectionProps = {
  round: RoundState | null;
  /** 發牌動畫初始垂直位移；窄視窗傳 0 可減少版面跳動。 */
  cardMotionY?: number;
};

export function DealerSection({ round, cardMotionY = 6 }: DealerSectionProps) {
  return (
    <div className="mt-3">
      <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-300">
        Dealer
      </p>
      <div className="flex min-h-12 flex-wrap justify-center gap-2 sm:min-h-14">
        {(round?.dealerCards ?? []).map((card, idx) => {
          const hidden = round?.phase === "player_turn" && idx === 1;
          return (
            <motion.div
              key={`${card.rank}-${card.suit}-${idx}`}
              initial={{ opacity: 0, y: cardMotionY, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18, delay: idx * 0.04 }}
              className={clsx(
                "relative flex aspect-2/3 w-10 items-center justify-center overflow-hidden rounded-md border text-sm font-semibold sm:w-11 md:w-12 lg:w-14 xl:w-16",
                hidden
                  ? "border-neutral-700 bg-neutral-900 text-neutral-500"
                  : "border-cyan-500/40 bg-neutral-900 text-cyan-100",
              )}
            >
              {hidden ? (
                <span className="absolute inset-0 block">
                  <Image
                    src={CHIP_CARD_ASSETS.cardBack}
                    alt="card back"
                    fill
                    sizes="(min-width: 1280px) 64px, (min-width: 1024px) 56px, (min-width: 768px) 48px, (min-width: 640px) 44px, 40px"
                    className="object-cover"
                  />
                </span>
              ) : (
                cardLabel(card)
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
