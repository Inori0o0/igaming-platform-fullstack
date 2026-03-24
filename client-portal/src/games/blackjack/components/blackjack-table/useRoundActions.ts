/**
 * 開局、Hit、Stand、Double、Split 與多手輪替；必要時呼叫 placeBlackjackWager（加扣款）。
 * 莊家補牌與最終 settleHands 不在此檔，結束後呼叫父層傳入的 settleRound。
 */
import { useMemo } from "react";
import {
  BLACKJACK_RULES,
  BLACKJACK_THEME_ID,
  canDoubleDown,
  canSplit,
  handValue,
  isBlackjack,
  settleHands,
} from "@/src/games/blackjack/logic/game";
import { buildStandardDeck } from "@/src/games/blackjack/logic/rng";
import type { BlackjackCard, PlayerHand } from "@/src/games/blackjack/logic/types";
import {
  DEAL_ANIMATION_MS,
  MAX_BET,
  MIN_BET,
  randomProvider,
} from "./constants";
import { createHand, draw, nextUnfinishedIndex, tierLabel } from "./helpers";
import type { MascotCue, RoundState } from "./types";

type Tone = "info" | "success" | "warning";

type UseRoundActionsParams = {
  bet: number;
  isBusy: boolean;
  vacBalance: number;
  round: RoundState | null;
  setRound: (updater: RoundState | null | ((prev: RoundState | null) => RoundState | null)) => void;
  setMessage: (value: string) => void;
  setEventTone: (value: Tone) => void;
  setMascotCue: (value: MascotCue) => void;
  setIsBusy: (value: boolean) => void;
  placeBlackjackWager: (params: { themeId: string; totalBet: number; roundId: string }) => Promise<boolean>;
  applyBlackjackPayout: (params: {
    themeId: string;
    payout: number;
    totalBet: number;
    roundId: string;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
  settleRound: (round: RoundState, hands: PlayerHand[], deck: BlackjackCard[]) => Promise<void>;
};

export function useRoundActions({
  bet,
  isBusy,
  vacBalance,
  round,
  setRound,
  setMessage,
  setEventTone,
  setMascotCue,
  setIsBusy,
  placeBlackjackWager,
  applyBlackjackPayout,
  settleRound,
}: UseRoundActionsParams) {
  const inRound = round && round.phase !== "idle" && round.phase !== "settled";
  const activeHand = round ? round.hands[round.activeHandIndex] : null;

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

  function advanceTurnOrSettle(baseRound: RoundState, nextHands: PlayerHand[], nextDeck: BlackjackCard[]) {
    const currentIdx = baseRound.activeHandIndex;
    const nextIdx = nextUnfinishedIndex(nextHands, currentIdx + 1);
    if (nextIdx >= 0) {
      setRound({ ...baseRound, hands: nextHands, deck: nextDeck, activeHandIndex: nextIdx });
      setMessage(`輪到手牌 ${nextIdx + 1}。`);
      setEventTone("info");
      return;
    }
    void settleRound(baseRound, nextHands, nextDeck);
  }

  async function startRound() {
    if (isBusy || inRound) return;
    if (bet < MIN_BET || bet > MAX_BET) return;
    if (vacBalance < bet) {
      setMessage("餘額不足，無法開始本局。");
      setEventTone("warning");
      setMascotCue("lose");
      return;
    }

    setIsBusy(true);
    setMessage("Tung Tung Tung Sahur 正在發牌...");
    setEventTone("info");
    setMascotCue("none");
    const roundId = crypto.randomUUID();

    const seed = await randomProvider.createRoundSeed(roundId);
    const deck = randomProvider.shuffleDeck(buildStandardDeck(), seed);
    const player = createHand([draw(deck), draw(deck)], bet);
    const dealerCards = [draw(deck), draw(deck)];
    const dealerBlackjack = isBlackjack(dealerCards);

    let phase: RoundState["phase"] = "player_turn";
    let settled: RoundState["settled"] = [];
    let payout = 0;
    let nextMessage = "你的回合：要牌、停牌、雙倍或分牌。";
    let streak = round?.streak ?? 0;

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

    const wagerOk = await placeBlackjackWager({
      themeId: BLACKJACK_THEME_ID,
      totalBet: bet,
      roundId,
    });
    if (!wagerOk) {
      setRound(null);
      setMessage("下注失敗，請稍後重試。");
      setEventTone("warning");
      setMascotCue("lose");
      setIsBusy(false);
      return;
    }

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
        settled[0]?.outcome === "blackjack" || settled[0]?.outcome === "win"
          ? `${tierLabel(settled[0]?.handTier ?? "points")}，本局直接結算。`
          : "本局已直接結算。";
      setEventTone((settled[0]?.net ?? 0) > 0 ? "success" : "info");
      setMascotCue((settled[0]?.net ?? 0) > 0 ? "win" : settled[0]?.net === 0 ? "none" : "lose");
    }

    window.setTimeout(() => {
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
    }, DEAL_ANIMATION_MS);
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
      setRound({ ...round, hands: updated.nextHands, deck: updated.nextDeck });
      window.setTimeout(() => {
        setMessage("Brr Brr! 爆牌了。");
        setEventTone("warning");
        setMascotCue("lose");
        advanceTurnOrSettle(round, updated.nextHands, updated.nextDeck);
      }, DEAL_ANIMATION_MS);
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
    if (!updated || !round) return;
    advanceTurnOrSettle(round, updated.nextHands, updated.nextDeck);
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
    advanceTurnOrSettle(round, updated.nextHands, updated.nextDeck);
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
    const updatedRound = {
      ...round,
      deck: nextDeck,
      hands: nextHands,
      activeHandIndex: nextIndex >= 0 ? nextIndex : round.activeHandIndex,
    };
    setRound(updatedRound);
    if (splittingAces && BLACKJACK_RULES.splitAcesReceiveOneCardOnly) {
      setMessage("A 分牌後每手只補一張，已自動鎖定。");
      setEventTone("info");
      if (nextUnfinishedIndex(nextHands, 0) < 0) {
        void settleRound(updatedRound, nextHands, nextDeck);
      }
      return;
    }
    setMessage("已分牌，先操作左手牌。");
    setEventTone("info");
  }

  const canHit = Boolean(activeHand && !activeHand.finished && !isBusy && inRound);
  const canStand = canHit;
  const canDouble = useMemo(
    () =>
      Boolean(
        activeHand &&
          canDoubleDown(activeHand) &&
          (BLACKJACK_RULES.doubleAfterSplit || (round?.hands.length ?? 1) === 1) &&
          !isBusy &&
          inRound,
      ),
    [activeHand, inRound, isBusy, round?.hands.length],
  );
  const canDoSplit = useMemo(
    () =>
      Boolean(
        activeHand &&
          canSplit(activeHand, {
            handsCount: round?.hands.length ?? 1,
            maxHandsAfterSplit: BLACKJACK_RULES.maxHandsAfterSplit,
          }) &&
          !isBusy &&
          inRound,
      ),
    [activeHand, inRound, isBusy, round?.hands.length],
  );

  return {
    inRound: Boolean(inRound),
    activeHand,
    canHit,
    canStand,
    canDouble,
    canDoSplit,
    startRound,
    hit,
    stand,
    doubleDown,
    split,
  };
}
