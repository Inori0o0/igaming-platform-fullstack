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

export type HandSettlement = {
  handId: string;
  outcome: SettlementOutcome;
  payout: number;
  net: number;
  finalPlayerTotal: number;
  finalDealerTotal: number;
  didSplit: boolean;
  didDouble: boolean;
};
