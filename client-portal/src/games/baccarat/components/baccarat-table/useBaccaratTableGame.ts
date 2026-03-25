/**
 * Baccarat 桌唯一對外 hook：
 * - 下注金額/下注區（閒/莊/和）
 * - RoundState、訊息、忙碌旗標、簡化路單
 * - 串接錢包：開局先扣款（wager）→「翻牌流程跑完後」才派彩（payout，含 0）
 *
 * 互動需求：按鈕驅動逐步翻牌/補牌/結算。
 * - 一顆主按鈕固定順序：先閒再莊；補牌也是先閒再莊
 * - 翻開最後一張牌時：先讓 table 立即顯示該牌；結算在下一個 tick 才執行（避免「翻牌=立刻出結果」的卡感）
 */
import { useState } from "react";
import { buildStandardDeck } from "@/src/games/blackjack/logic/rng";
import type { BlackjackCard } from "@/src/games/blackjack/logic/types";
import {
  BACCARAT_THEME_ID,
  baccaratCardValue,
  decideOutcome,
  isNatural,
  settleWager,
  shouldBankerDrawThird,
  shouldPlayerDrawThird,
  type BaccaratBetArea,
} from "@/src/games/baccarat/logic/game";
import { useWalletStore } from "@/src/store/walletStore";
import { DEAL_ANIMATION_MS, MAX_BET, MIN_BET, RESULT_MESSAGE_DELAY_MS, TABLE_BET_OPTIONS, randomProvider } from "./constants";
import { draw, outcomeLabel } from "./helpers";
import type { BaccaratRoundState, RoadEntry } from "./types";

type Tone = "info" | "success" | "warning";

export function useBaccaratTableGame() {
  const vacBalance = useWalletStore((s) => s.balances.VAC);
  const placeBaccaratWager = useWalletStore((s) => s.placeBaccaratWager);
  const applyBaccaratPayout = useWalletStore((s) => s.applyBaccaratPayout);

  const [bet, setBet] = useState(500);
  const [betStep, setBetStep] = useState<(typeof TABLE_BET_OPTIONS)[number]>(500);
  const [betArea, setBetArea] = useState<BaccaratBetArea>("player");

  const [round, setRound] = useState<BaccaratRoundState | null>(null);
  const [road, setRoad] = useState<RoadEntry[]>([]);

  const [message, setMessage] = useState("選擇下注區並下注後開始本局。");
  const [eventTone, setEventTone] = useState<Tone>("info");
  const [isBusy, setIsBusy] = useState(false);

  const inRound = Boolean(round && round.phase !== "idle" && round.phase !== "settled");

  async function startRound() {
    if (isBusy || inRound) return;
    if (bet < MIN_BET || bet > MAX_BET) return;
    if (vacBalance < bet) {
      setMessage("餘額不足，無法開始本局。");
      setEventTone("warning");
      return;
    }

    setIsBusy(true);
    setEventTone("info");
    setMessage("正在洗牌與發牌...");
    const roundId = crypto.randomUUID();

    const seed = await randomProvider.createRoundSeed(roundId);
    const deck = randomProvider.shuffleDeck(buildStandardDeck(), seed);

    const nextRound: BaccaratRoundState = {
      roundId,
      deck,
      playerCards: [],
      bankerCards: [],
      phase: "dealing",
      revealed: { player: 0, banker: 0 },
      betArea,
      wager: bet,
      outcome: null,
      payout: 0,
      isPush: false,
    };
    setRound(nextRound);

    const wagerOk = await placeBaccaratWager({
      themeId: BACCARAT_THEME_ID,
      totalBet: bet,
      roundId,
      metadata: { betArea },
    });
    if (!wagerOk) {
      setRound(null);
      setMessage("下注失敗，請稍後重試。");
      setEventTone("warning");
      setIsBusy(false);
      return;
    }

    // Deal: 先發兩手各兩張，但先不翻牌（revealed 計數仍為 0）。
    const dealingDeck: BlackjackCard[] = [...deck];
    const playerCards: BlackjackCard[] = [draw(dealingDeck), draw(dealingDeck)];
    const bankerCards: BlackjackCard[] = [draw(dealingDeck), draw(dealingDeck)];

    window.setTimeout(() => {
      setRound((prev) =>
        prev
          ? {
              ...prev,
              deck: dealingDeck,
              playerCards,
              bankerCards,
              phase: "dealt",
              revealed: { player: 0, banker: 0 },
            }
          : prev,
      );
    }, DEAL_ANIMATION_MS);

    setMessage("已發牌，按下「翻牌」開始：先翻閒家。");
    setEventTone("info");
    setIsBusy(false);
  }

  async function settleNow(current: BaccaratRoundState) {
    // settle is always invoked in a separate tick after the last reveal action.
    setIsBusy(true);
    setRound({ ...current, phase: "settling" });

    const outcome = decideOutcome(current.playerCards, current.bankerCards);
    const { payout, isPush } = settleWager({ wager: current.wager, betArea: current.betArea, outcome });

    const settledRound: BaccaratRoundState = {
      ...current,
      phase: "settled",
      outcome,
      payout,
      isPush,
      revealed: {
        player: current.playerCards.length,
        banker: current.bankerCards.length,
      },
    };
    setRound(settledRound);

    await applyBaccaratPayout({
      themeId: BACCARAT_THEME_ID,
      payout,
      totalBet: current.wager,
      roundId: current.roundId,
      metadata: {
        betArea: current.betArea,
        outcome,
        isPush,
        playerCards: current.playerCards.map((c) => `${c.rank}${c.suit}`),
        bankerCards: current.bankerCards.map((c) => `${c.rank}${c.suit}`),
      },
    });
    setRoad((prev) => [{ roundId: current.roundId, outcome }, ...prev].slice(0, 24));

    window.setTimeout(() => {
      if (payout === 0) {
        setMessage(`本局結算：${outcomeLabel(outcome)}（未命中）。`);
        setEventTone("warning");
      } else if (isPush) {
        setMessage(`本局結算：${outcomeLabel(outcome)}（Push 退回本金）。`);
        setEventTone("info");
      } else {
        setMessage(`本局結算：${outcomeLabel(outcome)}（派彩 ${payout}）。`);
        setEventTone("success");
      }
      setIsBusy(false);
    }, RESULT_MESSAGE_DELAY_MS);
  }

  async function advance() {
    if (isBusy) return;
    if (!round || round.phase === "idle" || round.phase === "settled") {
      await startRound();
      return;
    }
    if (round.phase === "dealing" || round.phase === "settling") return;

    // Phase transitions are driven by a single button, fixed order: player reveals -> banker reveals -> draw/reveal thirds -> settle.
    const next: BaccaratRoundState = { ...round };

    // Once dealt, move to revealing player
    if (next.phase === "dealt") {
      next.phase = "revealing_player";
    }

    if (next.phase === "revealing_player") {
      const nextCount = Math.min(next.playerCards.length, next.revealed.player + 1);
      next.revealed = { ...next.revealed, player: nextCount };
      setRound(next); // 先讓畫面立刻反映「多翻開一張」
      if (nextCount >= 2) {
        // 閒家兩張都已翻開：同一輪按鈕內順便切到「準備翻莊」階段，下一按才會進 revealing_banker 分支
        next.phase = "revealing_banker";
        setRound({ ...next });
        setMessage("輪到莊家翻牌。");
      } else {
        setMessage("翻閒家下一張。");
      }
      return;
    }

    if (next.phase === "revealing_banker") {
      const nextCount = Math.min(next.bankerCards.length, next.revealed.banker + 1);
      next.revealed = { ...next.revealed, banker: nextCount };
      setRound(next); // immediate UI reaction

      if (nextCount < 2) {
        setMessage("翻莊家下一張。");
        return;
      }

      // After both sides revealed 2 cards, determine natural / third-card needs.
      const natural = isNatural(next.playerCards, next.bankerCards);
      if (natural) {
        setMessage("已翻完兩手，準備結算...");
        // settle next tick to avoid reveal+result in the same beat
        window.setTimeout(() => void settleNow(next), 0);
        return;
      }

      if (shouldPlayerDrawThird(next.playerCards)) {
        next.phase = "drawing_player_third";
        setRound({ ...next });
        setMessage("閒家需要補牌，按一下補牌。");
        return;
      }

      // Player stands; banker decision based on null
      const bankerNeeds = shouldBankerDrawThird({ bankerCards: next.bankerCards, playerThirdValue: null });
      if (bankerNeeds) {
        next.phase = "drawing_banker_third";
        setRound({ ...next });
        setMessage("莊家需要補牌，按一下補牌。");
        return;
      }

      setMessage("無需補牌，準備結算...");
      window.setTimeout(() => void settleNow(next), 0);
      return;
    }

    if (next.phase === "drawing_player_third") {
      const deck = [...next.deck];
      const third = draw(deck);
      next.deck = deck;
      next.playerCards = [...next.playerCards, third];
      // do NOT reveal yet; next press will reveal
      next.phase = "revealing_player_third";
      setRound(next); // immediate: card count updated (still face-down)
      setMessage("已補牌，按一下翻開閒家補牌。");
      return;
    }

    if (next.phase === "revealing_player_third") {
      const nextCount = Math.min(next.playerCards.length, next.revealed.player + 1);
      next.revealed = { ...next.revealed, player: nextCount };
      setRound(next); // immediate reveal

      const third = next.playerCards[2];
      const playerThirdValue = third ? baccaratCardValue(third.rank) : null;
      const bankerNeeds = shouldBankerDrawThird({ bankerCards: next.bankerCards, playerThirdValue });
      if (bankerNeeds) {
        next.phase = "drawing_banker_third";
        setRound({ ...next });
        setMessage("莊家需要補牌，按一下補牌。");
        return;
      }

      setMessage("補牌完成，準備結算...");
      window.setTimeout(() => void settleNow(next), 0);
      return;
    }

    if (next.phase === "drawing_banker_third") {
      const deck = [...next.deck];
      const third = draw(deck);
      next.deck = deck;
      next.bankerCards = [...next.bankerCards, third];
      next.phase = "revealing_banker_third";
      setRound(next);
      setMessage("已補牌，按一下翻開莊家補牌。");
      return;
    }

    if (next.phase === "revealing_banker_third") {
      const nextCount = Math.min(next.bankerCards.length, next.revealed.banker + 1);
      next.revealed = { ...next.revealed, banker: nextCount };
      setRound(next);
      setMessage("補牌完成，準備結算...");
      window.setTimeout(() => void settleNow(next), 0);
      return;
    }
  }

  return {
    vacBalance,
    bet,
    setBet,
    betStep,
    setBetStep,
    betArea,
    setBetArea,
    round,
    road,
    message,
    eventTone,
    isBusy,
    inRound,
    advance,
  };
}

