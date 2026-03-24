/**
 * 牌桌共用工具：從牌堆抽牌、建立 PlayerHand、莊家可見點數、牌面文字與 tier 顯示標籤。
 */
import {
  classifyHandTier,
  isBlackjack,
  handValue,
} from "@/src/games/blackjack/logic/game";
import type { BlackjackCard, PlayerHand } from "@/src/games/blackjack/logic/types";

export function draw(deck: BlackjackCard[]): BlackjackCard {
  const card = deck.shift();
  if (!card) {
    throw new Error("Deck exhausted unexpectedly.");
  }
  return card;
}

export function createHand(
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

export function nextUnfinishedIndex(hands: PlayerHand[], fromIndex: number) {
  for (let i = fromIndex; i < hands.length; i += 1) {
    if (!hands[i]?.finished) return i;
  }
  return -1;
}

export function cardLabel(card: BlackjackCard) {
  const suitMap: Record<BlackjackCard["suit"], string> = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
  };
  return `${card.rank}${suitMap[card.suit]}`;
}

export function tierLabel(tier: ReturnType<typeof classifyHandTier>) {
  switch (tier) {
    case "big-five-21":
      return "大過五關";
    case "small-five":
      return "小過五關";
    case "blackjack":
      return "Blackjack";
    case "twenty-one":
      return "21點";
    case "points":
      return "普通點數";
    default:
      return "爆牌";
  }
}

export function tierGroup(tier: ReturnType<typeof classifyHandTier>) {
  if (tier === "big-five-21" || tier === "small-five") return "five-cards";
  if (tier === "blackjack" || tier === "twenty-one") return "twenty-one";
  return "normal";
}

export function dealerVisibleTotal(params: {
  roundPhase: "player_turn" | "dealing" | "idle" | "dealer_turn" | "settled";
  dealerCards: BlackjackCard[];
}) {
  const { roundPhase, dealerCards } = params;
  if (roundPhase === "player_turn" || roundPhase === "dealing") {
    const first = dealerCards[0];
    if (!first) return 0;
    return handValue([first]).total;
  }
  return handValue(dealerCards).total;
}
