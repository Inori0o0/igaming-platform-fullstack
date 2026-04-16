"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import type { BlackjackCard } from "@/src/games/blackjack/logic/types";
import { CHIP_CARD_ASSETS } from "./constants";
import { cardLabel } from "./helpers";

type CardCellProps = {
  hidden?: boolean;
  card?: BlackjackCard;
  index: number;
  accent: "player" | "banker";
  cardMotionY?: number;
};

export function CardCell(props: CardCellProps) {
  const { hidden, card, index, accent, cardMotionY = 6 } = props;

  return (
    <motion.div
      initial={{ opacity: 0, y: cardMotionY, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      className={clsx(
        "relative flex aspect-2/3 w-10 items-center justify-center overflow-hidden rounded-md border text-sm font-semibold sm:w-11 md:w-12 lg:w-14 xl:w-16",
        hidden
          ? "border-neutral-700/70 bg-neutral-900/60 text-neutral-500"
          : accent === "banker"
            ? "border-rose-400/35 bg-neutral-900/75 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.10)]"
            : "border-cyan-500/35 bg-neutral-900/75 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.10)]",
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
      ) : card ? (
        cardLabel(card)
      ) : (
        ""
      )}
    </motion.div>
  );
}
