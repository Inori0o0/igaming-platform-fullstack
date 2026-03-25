/**
 * 牌桌共用工具：抽牌、牌面文字、結果中文、點數（供 UI 顯示）。
 */
import type { BlackjackCard } from "@/src/games/blackjack/logic/types";
import { baccaratTotal } from "@/src/games/baccarat/logic/game";

export function draw(deck: BlackjackCard[]): BlackjackCard {
  const card = deck.shift();
  if (!card) throw new Error("Deck exhausted unexpectedly.");
  return card;
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

export function outcomeLabel(outcome: "player" | "banker" | "tie") {
  switch (outcome) {
    case "player":
      return "閒勝";
    case "banker":
      return "莊勝";
    default:
      return "和局";
  }
}

export function totalLabel(cards: BlackjackCard[]) {
  return baccaratTotal(cards);
}

