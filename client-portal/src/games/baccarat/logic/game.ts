/**
 * Baccarat 核心規則（純函式、無 React）：
 * - 計點（mod 10）
 * - Player/Banker 第三張判定（標準規則表）
 * - 結算與派彩：Player x1、Banker x0.95、Tie x8；非 Tie 下注遇 Tie -> Push
 */
import type { BlackjackCard, Rank } from "@/src/games/blackjack/logic/types";

export type BaccaratSide = "player" | "banker";
export type BaccaratOutcome = "player" | "banker" | "tie";
export type BaccaratBetArea = "player" | "banker" | "tie";

export const BACCARAT_THEME_ID = "italian-brainrot";

export const BACCARAT_PAYOUT = {
  player: 1.0,
  banker: 0.95,
  tie: 8,
} as const;

export function baccaratCardValue(rank: Rank): number {
  if (rank === "A") return 1;
  if (rank === "J" || rank === "Q" || rank === "K" || rank === "10") return 0;
  return Number(rank);
}

export function baccaratTotal(cards: BlackjackCard[]): number {
  const sum = cards.reduce((s, c) => s + baccaratCardValue(c.rank), 0);
  return sum % 10;
}

export function isNatural(playerCards: BlackjackCard[], bankerCards: BlackjackCard[]) {
  const pt = baccaratTotal(playerCards);
  const bt = baccaratTotal(bankerCards);
  return pt >= 8 || bt >= 8;
}

export function decideOutcome(playerCards: BlackjackCard[], bankerCards: BlackjackCard[]): BaccaratOutcome {
  const pt = baccaratTotal(playerCards);
  const bt = baccaratTotal(bankerCards);
  if (pt > bt) return "player";
  if (bt > pt) return "banker";
  return "tie";
}

/**
 * Player 第三張（標準規則）：
 * - total 0-5 抽牌
 * - total 6-7 停牌
 */
export function shouldPlayerDrawThird(playerCards: BlackjackCard[]): boolean {
  const total = baccaratTotal(playerCards);
  return total <= 5;
}

/**
 * Banker 第三張（標準規則表）。
 * 參數 playerThirdValue：若 Player 無第三張則為 null。
 */
export function shouldBankerDrawThird(params: {
  bankerCards: BlackjackCard[];
  playerThirdValue: number | null;
}): boolean {
  const bankerTotal = baccaratTotal(params.bankerCards);
  const v = params.playerThirdValue;

  // Player 站住：Banker 0-5 抽、6-7 停。
  if (v === null) {
    return bankerTotal <= 5;
  }

  // Player 有第三張：標準判定表
  switch (bankerTotal) {
    case 0:
    case 1:
    case 2:
      return true;
    case 3:
      return v !== 8;
    case 4:
      return v >= 2 && v <= 7;
    case 5:
      return v >= 4 && v <= 7;
    case 6:
      return v === 6 || v === 7;
    default:
      return false; // 7
  }
}

/**
 * 回傳「總派彩」（含回本金的 payout），與 outcome/push。
 * - betArea=player/banker/tie
 * - outcome=player/banker/tie
 *
 * 規則：
 * - 命中 player：payout = wager * (1 + 1.0) = 2x
 * - 命中 banker：payout = wager * (1 + 0.95) = 1.95x
 * - 命中 tie：payout = wager * (1 + 8) = 9x
 * - 非 tie 下注遇 tie：push 退回本金 payout = wager
 * - 其他輸：payout = 0
 */
export function settleWager(params: {
  wager: number;
  betArea: BaccaratBetArea;
  outcome: BaccaratOutcome;
}): { payout: number; isPush: boolean } {
  const wager = Math.max(0, Math.round(params.wager));
  if (wager <= 0) return { payout: 0, isPush: false };

  if (params.outcome === "tie" && params.betArea !== "tie") {
    return { payout: wager, isPush: true };
  }

  if (params.betArea !== params.outcome) {
    return { payout: 0, isPush: false };
  }

  const rate = BACCARAT_PAYOUT[params.outcome];
  const payout = Math.round(wager * (1 + rate));
  return { payout, isPush: false };
}

