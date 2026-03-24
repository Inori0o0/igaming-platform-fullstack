"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { useWalletStore } from "@/src/store/walletStore";
import {
  BLACKJACK_RULES,
  BLACKJACK_THEME_ID,
  canDoubleDown,
  canSplit,
  handValue,
  isBlackjack,
  settleHands,
  shouldDealerHit,
} from "@/src/games/blackjack/logic/game";
import { buildStandardDeck, resolveBlackjackRandomProvider } from "@/src/games/blackjack/logic/rng";
import type { BlackjackCard, HandSettlement, PlayerHand, RoundPhase } from "@/src/games/blackjack/logic/types";

type RoundState = {
  roundId: string;
  deck: BlackjackCard[];
  dealerCards: BlackjackCard[];
  hands: PlayerHand[];
  activeHandIndex: number;
  phase: RoundPhase;
  totalBet: number;
  settled: HandSettlement[];
  payout: number;
  streak: number;
};

const MIN_BET = 100;
const MAX_BET = 100000;
const BET_STEP = 100;
const TABLE_BET_OPTIONS = [100, 500, 1000, 5000] as const;
const RNG_MODE: "pseudo" | "server-seeded" = "pseudo";
const randomProvider = resolveBlackjackRandomProvider(RNG_MODE);
const BLACKJACK_ASSETS = {
  tableBackground: "/games/blackjack/bj_table_bg.png",
  dealer: {
    idle: "/games/blackjack/dealer/dealer_triplet_idle.png",
    win: "/games/blackjack/dealer/dealer_triplet_win.png",
    lose: "/games/blackjack/dealer/dealer_triplet_lose.png",
  },
  mascot: {
    brrIdle: "/games/blackjack/mascot/mascot_brr_idle.png",
    brrTriggered: "/games/blackjack/mascot/mascot_brr_triggered.png",
    bombardiroIdle: "/games/blackjack/mascot/mascot_bombardiro_idle.png",
    bombardiroTriggered: "/games/blackjack/mascot/mascot_bombardiro_triggered.png",
  },
} as const;

const CHIP_CARD_ASSETS = {
  cardBack: "/games/chip_card/bj_card_back.png",
  chips: {
    100: "/games/chip_card/chip_100.png",
    500: "/games/chip_card/chip_500.png",
    1000: "/games/chip_card/chip_1000.png",
    5000: "/games/chip_card/chip_5000.png",
  },
} as const;

function draw(deck: BlackjackCard[]): BlackjackCard {
  const card = deck.shift();
  if (!card) {
    throw new Error("Deck exhausted unexpectedly.");
  }
  return card;
}

function createHand(
  cards: BlackjackCard[],
  wager: number,
  options?: { splitFromAces?: boolean; disableNaturalBlackjack?: boolean },
): PlayerHand {
  const blackjack = isBlackjack(cards);
  return {
    id: crypto.randomUUID(),
    cards,
    wager,
    doubled: false,
    splitFromAces: options?.splitFromAces ?? false,
    stood: options?.splitFromAces ? true : blackjack,
    busted: false,
    blackjack: options?.disableNaturalBlackjack ? false : blackjack,
    finished: options?.splitFromAces ? true : blackjack,
    result: options?.splitFromAces ? "stand" : blackjack ? "blackjack" : "playing",
  };
}

function nextUnfinishedIndex(hands: PlayerHand[], fromIndex: number) {
  for (let i = fromIndex; i < hands.length; i += 1) {
    if (!hands[i]?.finished) return i;
  }
  return -1;
}

function cardLabel(card: BlackjackCard) {
  const suitMap: Record<BlackjackCard["suit"], string> = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
  };
  return `${card.rank}${suitMap[card.suit]}`;
}

export function BlackjackTable() {
  const vacBalance = useWalletStore((s) => s.balances.VAC);
  const placeBlackjackWager = useWalletStore((s) => s.placeBlackjackWager);
  const applyBlackjackPayout = useWalletStore((s) => s.applyBlackjackPayout);
  const [bet, setBet] = useState(500);
  const [round, setRound] = useState<RoundState | null>(null);
  const [message, setMessage] = useState("請先下注後開始本局。");
  const [eventTone, setEventTone] = useState<"info" | "success" | "warning">("info");
  const [isBusy, setIsBusy] = useState(false);

  const inRound = round && round.phase !== "idle" && round.phase !== "settled";
  const activeHand = round ? round.hands[round.activeHandIndex] : null;

  const dealerVisibleTotal = useMemo(() => {
    if (!round) return 0;
    if (round.phase === "player_turn" || round.phase === "dealing") {
      const first = round.dealerCards[0];
      if (!first) return 0;
      return handValue([first]).total;
    }
    return handValue(round.dealerCards).total;
  }, [round]);

  const dealerMood = useMemo(() => {
    if (!round || round.phase !== "settled") return "idle" as const;
    const anyPositive = round.settled.some((s) => s.net > 0);
    return anyPositive ? ("lose" as const) : ("win" as const);
  }, [round]);

  const brrTriggered =
    eventTone === "warning" ||
    message.includes("Brr") ||
    message.includes("Blackjack");
  const bombardiroTriggered = message.includes("Bombardiro");

  async function startRound() {
    if (isBusy || inRound) return;
    if (bet < MIN_BET || bet > MAX_BET) return;
    if (vacBalance < bet) {
      setMessage("餘額不足，無法開始本局。");
      return;
    }
    setIsBusy(true);
    setMessage("Lirili Larila 正在洗牌...");
    setEventTone("info");
    const roundId = crypto.randomUUID();
    const wagerOk = await placeBlackjackWager({
      themeId: BLACKJACK_THEME_ID,
      totalBet: bet,
      roundId,
    });
    if (!wagerOk) {
      setMessage("下注失敗，請稍後重試。");
      setIsBusy(false);
      return;
    }

    const seed = await randomProvider.createRoundSeed(roundId);
    const deck = randomProvider.shuffleDeck(buildStandardDeck(), seed);
    const player = createHand([draw(deck), draw(deck)], bet);
    const dealerCards = [draw(deck), draw(deck)];
    const dealerBlackjack = isBlackjack(dealerCards);

    let phase: RoundPhase = "player_turn";
    let settled: HandSettlement[] = [];
    let payout = 0;
    let nextMessage = "你的回合：要牌、停牌、雙倍或分牌。";
    let streak = round?.streak ?? 0;

    if (player.blackjack || dealerBlackjack) {
      phase = "settled";
      const result = settleHands({ hands: [player], dealerCards });
      settled = result.settlements;
      payout = result.totalPayout;
      await applyBlackjackPayout({
        themeId: BLACKJACK_THEME_ID,
        payout,
        totalBet: bet,
        roundId,
        metadata: {
          result: settled[0]?.outcome ?? "push",
          playerTotal: settled[0]?.finalPlayerTotal ?? handValue(player.cards).total,
          dealerTotal: settled[0]?.finalDealerTotal ?? handValue(dealerCards).total,
          didSplit: false,
          didDouble: false,
        },
      });
      if ((settled[0]?.net ?? 0) > 0) streak += 1;
      else streak = 0;
      nextMessage =
        settled[0]?.outcome === "blackjack"
          ? "Brr Brr! Blackjack！"
          : "本局已直接結算。";
      setEventTone(settled[0]?.outcome === "blackjack" ? "success" : "info");
    }

    setRound({
      roundId,
      deck,
      dealerCards,
      hands: [player],
      activeHandIndex: 0,
      phase,
      totalBet: bet,
      settled,
      payout,
      streak,
    });
    setMessage(nextMessage);
    setIsBusy(false);
  }

  function withUpdatedActiveHand(
    updater: (hand: PlayerHand, deck: BlackjackCard[]) => PlayerHand,
  ) {
    if (!round || round.phase !== "player_turn") return null;
    const nextHands = [...round.hands];
    const nextDeck = [...round.deck];
    const current = nextHands[round.activeHandIndex];
    if (!current || current.finished) return null;
    nextHands[round.activeHandIndex] = updater(current, nextDeck);
    return { nextHands, nextDeck };
  }

  function advanceTurnOrSettle(nextHands: PlayerHand[], nextDeck: BlackjackCard[]) {
    if (!round) return;
    const currentIdx = round.activeHandIndex;
    const nextIdx = nextUnfinishedIndex(nextHands, currentIdx + 1);
    if (nextIdx >= 0) {
      setRound({ ...round, hands: nextHands, deck: nextDeck, activeHandIndex: nextIdx });
      setMessage(`輪到手牌 ${nextIdx + 1}。`);
      setEventTone("info");
      return;
    }
    void settleRound(nextHands, nextDeck);
  }

  async function settleRound(nextHands: PlayerHand[], nextDeck: BlackjackCard[]) {
    if (!round) return;
    setIsBusy(true);
    setMessage("Lirili Larila 正在補牌與結算...");

    const dealerCards = [...round.dealerCards];
    while (shouldDealerHit(dealerCards)) {
      dealerCards.push(draw(nextDeck));
    }

    const settled = settleHands({ hands: nextHands, dealerCards });
    await applyBlackjackPayout({
      themeId: BLACKJACK_THEME_ID,
      payout: settled.totalPayout,
      totalBet: round.totalBet,
      roundId: round.roundId,
      metadata: {
        result: settled.settlements.map((s) => s.outcome).join(","),
        playerTotal: settled.settlements.map((s) => s.finalPlayerTotal).join(","),
        dealerTotal: settled.settlements[0]?.finalDealerTotal ?? handValue(dealerCards).total,
        didSplit: nextHands.length > 1,
        didDouble: nextHands.some((h) => h.doubled),
      },
    });

    const won = settled.settlements.some((s) => s.net > 0);
    const streak = won ? round.streak + 1 : 0;
    setRound({
      ...round,
      deck: nextDeck,
      dealerCards,
      hands: nextHands,
      phase: "settled",
      settled: settled.settlements,
      payout: settled.totalPayout,
      streak,
    });
    setIsBusy(false);
    if (settled.settlements.some((s) => s.net >= 2000)) {
      setMessage("Bombardiro Crocodilo 點亮炸彈：大額贏面達成！");
      setEventTone("success");
    } else if (streak >= 2) {
      setMessage(`Brr Brr！目前連勝 ${streak} 局。`);
      setEventTone("success");
    } else {
      setMessage("本局完成，準備下一局。");
      setEventTone("info");
    }
  }

  function hit() {
    const updated = withUpdatedActiveHand((hand, deck) => {
      const cards = [...hand.cards, draw(deck)];
      const total = handValue(cards).total;
      const busted = total > 21;
      return {
        ...hand,
        cards,
        busted,
        finished: busted,
        result: busted ? "bust" : "playing",
      };
    });
    if (!updated || !round) return;
    const now = updated.nextHands[round.activeHandIndex];
    if (now?.busted) {
      setMessage("Brr Brr! 爆牌了。");
      setEventTone("warning");
      advanceTurnOrSettle(updated.nextHands, updated.nextDeck);
      return;
    }
    setRound({ ...round, hands: updated.nextHands, deck: updated.nextDeck });
  }

  function stand() {
    const updated = withUpdatedActiveHand((hand) => ({
      ...hand,
      stood: true,
      finished: true,
      result: "stand",
    }));
    if (!updated) return;
    advanceTurnOrSettle(updated.nextHands, updated.nextDeck);
  }

  async function doubleDown() {
    if (!round || round.phase !== "player_turn") return;
    const hand = round.hands[round.activeHandIndex];
    if (!hand || !canDoubleDown(hand)) return;
    if (!BLACKJACK_RULES.doubleAfterSplit && round.hands.length > 1) return;
    if (vacBalance < hand.wager) {
      setMessage("餘額不足，無法雙倍。");
      setEventTone("warning");
      return;
    }
    setIsBusy(true);
    const ok = await placeBlackjackWager({
      themeId: BLACKJACK_THEME_ID,
      totalBet: hand.wager,
      roundId: round.roundId,
    });
    setIsBusy(false);
    if (!ok) {
      setMessage("雙倍扣款失敗，請稍後再試。");
      setEventTone("warning");
      return;
    }

    const updated = withUpdatedActiveHand((current, deck) => {
      const cards = [...current.cards, draw(deck)];
      const total = handValue(cards).total;
      const busted = total > 21;
      return {
        ...current,
        cards,
        wager: current.wager * 2,
        doubled: true,
        busted,
        stood: !busted,
        finished: true,
        result: busted ? "bust" : "stand",
      };
    });
    if (!updated) return;
    setMessage("雙倍完成，該手牌自動停牌。");
    setEventTone("info");
    advanceTurnOrSettle(updated.nextHands, updated.nextDeck);
  }

  async function split() {
    if (!round || round.phase !== "player_turn") return;
    const hand = round.hands[round.activeHandIndex];
    if (
      !hand ||
      !canSplit(hand, {
        handsCount: round.hands.length,
        maxHandsAfterSplit: BLACKJACK_RULES.maxHandsAfterSplit,
      })
    ) {
      return;
    }
    if (vacBalance < hand.wager) {
      setMessage("餘額不足，無法分牌。");
      setEventTone("warning");
      return;
    }
    setIsBusy(true);
    const ok = await placeBlackjackWager({
      themeId: BLACKJACK_THEME_ID,
      totalBet: hand.wager,
      roundId: round.roundId,
    });
    setIsBusy(false);
    if (!ok) {
      setMessage("分牌扣款失敗，請稍後再試。");
      setEventTone("warning");
      return;
    }

    const nextDeck = [...round.deck];
    const splittingAces = hand.cards[0]?.rank === "A";
    const left = createHand([hand.cards[0]!, draw(nextDeck)], hand.wager, {
      splitFromAces: splittingAces && BLACKJACK_RULES.splitAcesReceiveOneCardOnly,
      disableNaturalBlackjack: splittingAces,
    });
    const right = createHand([hand.cards[1]!, draw(nextDeck)], hand.wager, {
      splitFromAces: splittingAces && BLACKJACK_RULES.splitAcesReceiveOneCardOnly,
      disableNaturalBlackjack: splittingAces,
    });
    const nextHands = [...round.hands];
    nextHands.splice(round.activeHandIndex, 1, left, right);
    const nextIndex = nextUnfinishedIndex(nextHands, round.activeHandIndex);
    setRound({
      ...round,
      deck: nextDeck,
      hands: nextHands,
      activeHandIndex: nextIndex >= 0 ? nextIndex : round.activeHandIndex,
    });
    if (splittingAces && BLACKJACK_RULES.splitAcesReceiveOneCardOnly) {
      setMessage("A 分牌後每手只補一張，已自動鎖定。");
      setEventTone("info");
      if (nextUnfinishedIndex(nextHands, 0) < 0) {
        void settleRound(nextHands, nextDeck);
      }
      return;
    }
    setMessage("已分牌，先操作左手牌。");
    setEventTone("info");
  }

  const canHit = Boolean(activeHand && !activeHand.finished && !isBusy && inRound);
  const canStand = canHit;
  const canDouble = Boolean(
    activeHand &&
      canDoubleDown(activeHand) &&
      (BLACKJACK_RULES.doubleAfterSplit || (round?.hands.length ?? 1) === 1) &&
      !isBusy &&
      inRound,
  );
  const canDoSplit = Boolean(
    activeHand &&
      canSplit(activeHand, {
        handsCount: round?.hands.length ?? 1,
        maxHandsAfterSplit: BLACKJACK_RULES.maxHandsAfterSplit,
      }) &&
      !isBusy &&
      inRound,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-neutral-950/70 p-4 shadow-[0_0_60px_rgba(34,211,238,0.16)]">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${BLACKJACK_ASSETS.tableBackground})` }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/35 via-black/45 to-black/70" />

        <motion.div
          className="pointer-events-none absolute right-2 top-2 hidden h-40 w-40 sm:block"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={BLACKJACK_ASSETS.dealer[dealerMood]}
            alt="Tung Tung Tung Sahur dealer"
            fill
            unoptimized
            sizes="160px"
            className="object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.45)]"
          />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-2 left-2 hidden h-28 w-28 sm:block"
          animate={{ scale: brrTriggered ? [1, 1.12, 1] : [1, 1.04, 1] }}
          transition={{ duration: brrTriggered ? 0.5 : 2.2, repeat: Infinity }}
        >
          <Image
            src={
              brrTriggered
                ? BLACKJACK_ASSETS.mascot.brrTriggered
                : BLACKJACK_ASSETS.mascot.brrIdle
            }
            alt="Brr Brr Patapim mascot"
            fill
            unoptimized
            sizes="112px"
            className="object-contain drop-shadow-[0_0_16px_rgba(34,211,238,0.4)]"
          />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-2 right-2 hidden h-28 w-28 sm:block"
          animate={{
            scale: bombardiroTriggered ? [1, 1.1, 1] : 1,
            rotate: bombardiroTriggered ? [0, -2, 2, 0] : 0,
          }}
          transition={{ duration: bombardiroTriggered ? 0.45 : 1.2, repeat: bombardiroTriggered ? 2 : 0 }}
        >
          <Image
            src={
              bombardiroTriggered
                ? BLACKJACK_ASSETS.mascot.bombardiroTriggered
                : BLACKJACK_ASSETS.mascot.bombardiroIdle
            }
            alt="Bombardiro Crocodilo mascot"
            fill
            unoptimized
            sizes="112px"
            className="object-contain drop-shadow-[0_0_18px_rgba(245,158,11,0.35)]"
          />
        </motion.div>

        <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Tung Tung Tung Sahur Table
          </p>
          <span className="text-[11px] text-neutral-500">
            dealer total: {dealerVisibleTotal}
          </span>
        </div>

        <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-black/20 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Dealer
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(round?.dealerCards ?? []).map((card, idx) => {
              const hidden = round?.phase === "player_turn" && idx === 1;
              return (
                <motion.div
                  key={`${card.rank}-${card.suit}-${idx}`}
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18, delay: idx * 0.04 }}
                  className={clsx(
                    "rounded-md border px-2 py-1 text-xs",
                    hidden
                      ? "border-neutral-700 bg-neutral-900 text-neutral-500"
                      : "border-cyan-500/40 bg-neutral-900 text-cyan-100",
                  )}
                >
                  {hidden ? (
                    <span className="relative inline-block h-10 w-7">
                      <Image
                        src={CHIP_CARD_ASSETS.cardBack}
                        alt="card back"
                        fill
                        unoptimized
                        sizes="28px"
                        className="rounded-sm object-cover"
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

        <div className="mt-3 space-y-3">
          {(round?.hands ?? []).map((hand, index) => {
            const total = handValue(hand.cards).total;
            const isActive = round?.activeHandIndex === index && round.phase === "player_turn";
            const settlement = round?.settled.find((s) => s.handId === hand.id);
            return (
              <div
                key={hand.id}
                className={clsx(
                  "rounded-2xl border bg-black/20 p-3",
                  isActive ? "border-cyan-400/50" : "border-cyan-500/20",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Player Hand {index + 1}
                  </p>
                  <span className="text-[11px] text-cyan-200">
                    total {total} / bet {hand.wager}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hand.cards.map((card, cardIdx) => (
                    <motion.div
                      key={`${hand.id}-${card.rank}-${card.suit}-${cardIdx}`}
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.18, delay: cardIdx * 0.04 }}
                      className="rounded-md border border-cyan-500/40 bg-neutral-900 px-2 py-1 text-xs text-cyan-100"
                    >
                      {cardLabel(card)}
                    </motion.div>
                  ))}
                </div>
                {settlement ? (
                  <p className="mt-2 text-[11px] text-neutral-300">
                    結果：{settlement.outcome}（net {settlement.net >= 0 ? "+" : ""}
                    {settlement.net}）
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        </div>
      </div>

      <div className="space-y-4">
        <Card title="操作區" description="標準玩法：Hit / Stand / Double / Split">
          <div className="space-y-3 text-[11px] text-neutral-300">
            <div className="rounded-xl border border-cyan-500/15 bg-neutral-950/70 px-3 py-2">
              <p className="text-neutral-400">下注金額 (VAC)</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {TABLE_BET_OPTIONS.map((option) => (
                  <button
                    key={option}
                    disabled={Boolean(inRound) || isBusy}
                    onClick={() => setBet(option)}
                    className={clsx(
                      "group relative flex items-center gap-2 rounded-xl border px-2 py-1.5 text-left transition",
                      bet === option
                        ? "border-cyan-300/70 bg-cyan-500/10"
                        : "border-cyan-500/20 bg-neutral-950/70 hover:border-cyan-400/40",
                      "disabled:cursor-not-allowed disabled:opacity-45",
                    )}
                  >
                    <span className="relative h-9 w-9 shrink-0">
                      <Image
                        src={CHIP_CARD_ASSETS.chips[option]}
                        alt={`chip ${option}`}
                        fill
                        unoptimized
                        sizes="36px"
                        className="object-contain"
                      />
                    </span>
                    <span className="text-xs font-semibold text-cyan-100">{option}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={Boolean(inRound) || isBusy}
                  onClick={() => setBet((v) => Math.max(MIN_BET, v - BET_STEP))}
                >
                  -{BET_STEP}
                </Button>
                <span className="text-cyan-100">{bet}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={Boolean(inRound) || isBusy}
                  onClick={() => setBet((v) => Math.min(MAX_BET, v + BET_STEP))}
                >
                  +{BET_STEP}
                </Button>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-100">
                  <span className="relative h-3.5 w-3.5">
                    <Image
                      src={CHIP_CARD_ASSETS.cardBack}
                      alt="deck"
                      fill
                      unoptimized
                      sizes="14px"
                      className="rounded-sm object-cover"
                    />
                  </span>
                  Card Back Enabled
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={startRound} disabled={Boolean(inRound) || isBusy}>
                開始本局
              </Button>
              <Button variant="outline" onClick={hit} disabled={!canHit}>
                要牌 Hit
              </Button>
              <Button variant="outline" onClick={stand} disabled={!canStand}>
                停牌 Stand
              </Button>
              <Button variant="outline" onClick={doubleDown} disabled={!canDouble}>
                雙倍 Double
              </Button>
              <Button
                variant="outline"
                onClick={split}
                disabled={!canDoSplit}
                className="col-span-2"
              >
                分牌 Split
              </Button>
            </div>

            <motion.div
              key={`${eventTone}:${message}`}
              initial={{ opacity: 0.5, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={clsx(
                "rounded-xl border bg-neutral-950/70 p-3",
                eventTone === "success" && "border-emerald-400/35",
                eventTone === "warning" && "border-amber-400/35",
                eventTone === "info" && "border-cyan-500/15",
              )}
            >
              <p className="text-neutral-400">桌面訊息</p>
              <p className="mt-1 text-neutral-200">{message}</p>
              {round?.phase === "settled" ? (
                <p className="mt-1 text-cyan-200">
                  本局總派彩：{round.payout}（原始總下注 {round.hands.reduce((s, h) => s + h.wager, 0)}）
                </p>
              ) : null}
            </motion.div>
          </div>
        </Card>

        <Card title="角色演出（強化版）" description="以輕動畫 + 事件提示對應 Brainrot 角色。">
          <ul className="list-disc space-y-1 pl-5 text-[11px] text-neutral-300">
            <li>Lirili Larila：開局洗牌、補牌與結算提示。</li>
            <li>Brr Brr Patapim：Blackjack、爆牌、連勝提示。</li>
            <li>Bombardiro Crocodilo：高額贏面事件提示。</li>
            <li>Elefanto Cactuso：籌碼區與牌桌守護意象（文案預留）。</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
