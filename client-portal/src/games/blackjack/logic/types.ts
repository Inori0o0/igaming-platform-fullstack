/**
 * 牌局資料模型：牌、玩家手牌、回合階段、結算結果與 HandTier（過五關／Blackjack 等）。
 * 與 `blackjack-table/types.ts`（RoundState）分工：此處偏「規則層」，彼處偏「一局 UI 快照」。
 */
export type Suit = "S" | "H" | "D" | "C";

export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type BlackjackCard = {
  rank: Rank;
  suit: Suit;
};

export type HandResult = "playing" | "stand" | "bust" | "blackjack";

export type PlayerHand = {
  id: string;
  cards: BlackjackCard[];
  wager: number;
  doubled: boolean;
  splitFromAces: boolean;
  stood: boolean;
  busted: boolean;
  blackjack: boolean;
  finished: boolean;
  result: HandResult;
};

export type RoundPhase =
  | "idle"
  | "dealing"
  | "player_turn"
  | "dealer_turn"
  | "settled";

export type SettlementOutcome = "win" | "lose" | "push" | "blackjack";
export type HandTier =
  | "big-five-21"
  | "small-five"
  | "blackjack"
  | "twenty-one"
  | "points"
  | "bust";

export type HandSettlement = {
  handId: string;
  outcome: SettlementOutcome;
  handTier: HandTier;
  payout: number;
  net: number;
  finalPlayerTotal: number;
  finalDealerTotal: number;
  didSplit: boolean;
  didDouble: boolean;
};
