/**
 * 莊家依規則補牌 → settleHands → applyBlackjackPayout，並延遲更新訊息／吉祥物 cue。
 */
import { BLACKJACK_THEME_ID, handValue, settleHands, shouldDealerHit } from "@/src/games/blackjack/logic/game";
import type { PlayerHand } from "@/src/games/blackjack/logic/types";
import { RESULT_MESSAGE_DELAY_MS } from "./constants";
import { draw, tierLabel } from "./helpers";
import type { MascotCue, RoundState } from "./types";

type Tone = "info" | "success" | "warning";

type UseRoundSettlementParams = {
  setRound: (updater: RoundState | null | ((prev: RoundState | null) => RoundState | null)) => void;
  setMessage: (value: string) => void;
  setEventTone: (value: Tone) => void;
  setMascotCue: (value: MascotCue) => void;
  setIsBusy: (value: boolean) => void;
  applyBlackjackPayout: (params: {
    themeId: string;
    payout: number;
    totalBet: number;
    roundId: string;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
};

export function useRoundSettlement({
  setRound,
  setMessage,
  setEventTone,
  setMascotCue,
  setIsBusy,
  applyBlackjackPayout,
}: UseRoundSettlementParams) {
  async function settleRound(round: RoundState, nextHands: PlayerHand[], nextDeck: RoundState["deck"]) {
    setIsBusy(true);
    setMessage("Tung Tung Tung Sahur 正在補牌與結算...");

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
    const settledRound: RoundState = {
      ...round,
      deck: nextDeck,
      dealerCards,
      hands: nextHands,
      phase: "settled",
      settled: settled.settlements,
      payout: settled.totalPayout,
      streak,
    };
    setRound(settledRound);
    setIsBusy(false);

    window.setTimeout(() => {
      const topTier = settled.settlements[0]?.handTier ?? "points";
      const hasAnyWin = settled.settlements.some((s) => s.net > 0);
      const hasAnyLose = settled.settlements.some((s) => s.net < 0);
      if (settled.settlements.some((s) => s.net >= 2000)) {
        setMessage(`Bombardiro Crocodilo 點亮炸彈：${tierLabel(topTier)} 大額贏面達成！`);
        setEventTone("success");
      } else if (streak >= 2) {
        setMessage(`Brr Brr！${tierLabel(topTier)}，目前連勝 ${streak} 局。`);
        setEventTone("success");
      } else if (settled.settlements.some((s) => s.net > 0)) {
        setMessage(`本局完成：${tierLabel(topTier)}。`);
        setEventTone("success");
      } else if (settled.settlements.every((s) => s.outcome === "push")) {
        setMessage("本局和局（Push）。");
        setEventTone("info");
      } else {
        setMessage("本局落敗，準備下一局。");
        setEventTone("warning");
      }

      if (hasAnyWin) setMascotCue("win");
      else if (hasAnyLose) setMascotCue("lose");
      else setMascotCue("none");
    }, RESULT_MESSAGE_DELAY_MS);
  }

  return { settleRound };
}
