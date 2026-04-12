"use client";

/**
 * 牌桌視覺：背景、吉祥物層、莊上閒下牌列。
 * 依 `round.revealed` 決定每張牌顯示正面或牌背；結算後可延遲全部蓋回牌背（純顯示）。
 */
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { BlackjackCard } from "@/src/games/blackjack/logic/types";
import { useIsCompactTableViewport } from "@/src/games/useCompactTableViewport";
import { baccaratTotal } from "@/src/games/baccarat/logic/game";
import { BACCARAT_ASSETS, CHIP_CARD_ASSETS } from "./constants";
import { cardLabel } from "./helpers";
import { MascotLayer } from "./MascotLayer";
import type { BaccaratRoundState } from "./types";

type TableStageProps = {
  round: BaccaratRoundState | null;
};

function CardCell(props: {
  hidden?: boolean;
  card?: BlackjackCard;
  index: number;
  accent: "player" | "banker";
  cardMotionY?: number;
}) {
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

function SideSection(props: {
  cards: BaccaratRoundState["playerCards"];
  accent: "player" | "banker";
  label: string;
  hideCards: boolean;
  revealedCount: number;
  cardMotionY: number;
  compact: boolean;
}) {
  const { cards, accent, label, hideCards, revealedCount, cardMotionY, compact } = props;
  // 僅用「已翻開」的牌計點，避免在未翻牌或補牌前洩漏即將出現的 total。
  const visibleCards = hideCards ? [] : cards.slice(0, Math.min(revealedCount, cards.length));
  const total = visibleCards.length ? baccaratTotal(visibleCards) : 0;
  const showTotal = visibleCards.length > 0;
  const hideCount = cards.length > 0 ? cards.length : 2;
  return (
    <div className="rounded-2xl bg-black/15 px-2 py-2 sm:px-3">
      <div className="flex items-center justify-between gap-3">
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
        ) : null}
      </div>

      <div
        className={clsx(
          "mt-2 flex flex-wrap items-center justify-center gap-2",
          compact && "min-h-[88px] content-start",
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

export function TableStage({ round }: TableStageProps) {
  const [hideCardsAfterSettle, setHideCardsAfterSettle] = useState(false);
  const compact = useIsCompactTableViewport();
  const cardMotionY = compact ? 0 : 6;

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
        "relative min-h-[260px] overflow-visible rounded-3xl bg-neutral-950/70 p-3 shadow-[0_0_60px_rgba(34,211,238,0.16)] sm:min-h-[300px]",
        compact && "min-h-[300px] sm:min-h-[330px]",
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
            compact={compact}
          />
          <SideSection
            cards={round?.playerCards ?? []}
            accent="player"
            label="Player（閒）"
            hideCards={hideCardsAfterSettle}
            revealedCount={round?.revealed.player ?? 0}
            cardMotionY={cardMotionY}
            compact={compact}
          />
        </div>
      </div>
    </div>
  );
}

