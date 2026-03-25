/**
 * 百家樂「一局」的前端快照型別。
 * - `phase`：按鈕驅動的翻牌／補牌／結算流程（見 useBaccaratTableGame）。
 * - `revealed`：閒／莊各已「翻開」幾張牌（其餘以牌背顯示）。
 */
import type { BlackjackCard } from "@/src/games/blackjack/logic/types";
import type { BaccaratBetArea, BaccaratOutcome } from "@/src/games/baccarat/logic/game";

export type BaccaratRoundPhase =
  | "idle"
  | "dealing"
  | "dealt"
  | "revealing_player"
  | "revealing_banker"
  | "drawing_player_third"
  | "revealing_player_third"
  | "drawing_banker_third"
  | "revealing_banker_third"
  | "settling"
  | "settled";

export type BaccaratRoundState = {
  roundId: string;
  deck: BlackjackCard[];
  playerCards: BlackjackCard[];
  bankerCards: BlackjackCard[];
  phase: BaccaratRoundPhase;
  revealed: {
    player: number;
    banker: number;
  };
  betArea: BaccaratBetArea;
  wager: number;
  outcome: BaccaratOutcome | null;
  payout: number;
  isPush: boolean;
};

export type RoadEntry = {
  roundId: string;
  outcome: BaccaratOutcome;
};

