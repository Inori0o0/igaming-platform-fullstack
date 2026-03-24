/**
 * 二十一點核心規則（純函式、無 React）：
 * 算點、莊家 S17、分牌／雙倍條件、手牌階級（含過五關）、結算與派彩倍率。
 * 供單元測試與前端 hooks 共用；UI 不得直接改寫此處狀態。
 */
import type {
  BlackjackCard,
  HandTier,
  HandSettlement,
  PlayerHand,
  SettlementOutcome,
} from "./types";

export const BLACKJACK_THEME_ID = "italian-brainrot";
export const BLACKJACK_PAYOUT_MULTIPLIER = 1.5;
export const BLACKJACK_RULES = {
  dealerHitsSoft17: false, // S17
  doubleAfterSplit: true, // DAS
  maxHandsAfterSplit: 4, // resplit up to 4 hands
  splitAcesReceiveOneCardOnly: true,
} as const;

export function handValue(cards: BlackjackCard[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === "A") {
      aces += 1;
      total += 11;
      continue;
    }
    if (card.rank === "K" || card.rank === "Q" || card.rank === "J") {
      total += 10;
      continue;
    }
    total += Number(card.rank);
  }

  let soft = false;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  if (aces > 0) soft = true;

  return { total, soft };
}

export function isBlackjack(cards: BlackjackCard[]): boolean {
  if (cards.length !== 2) return false;
  const [c1, c2] = cards;
  if (!c1 || !c2) return false;
  const tenLike = (rank: BlackjackCard["rank"]) =>
    rank === "10" || rank === "J" || rank === "Q" || rank === "K";
  return (c1.rank === "A" && tenLike(c2.rank)) || (c2.rank === "A" && tenLike(c1.rank));
}

export function canSplit(
  hand: PlayerHand,
  context?: {
    handsCount?: number;
    maxHandsAfterSplit?: number;
  },
): boolean {
  if (hand.cards.length !== 2 || hand.doubled || hand.stood || hand.busted) return false;
  if (
    context?.handsCount &&
    context?.maxHandsAfterSplit &&
    context.handsCount >= context.maxHandsAfterSplit
  ) {
    return false;
  }
  return hand.cards[0]?.rank === hand.cards[1]?.rank;
}

export function shouldDealerHit(dealerCards: BlackjackCard[]): boolean {
  const { total, soft } = handValue(dealerCards);
  if (total < 17) return true;
  if (total === 17 && soft) return BLACKJACK_RULES.dealerHitsSoft17;
  return false;
}

export function canDoubleDown(hand: PlayerHand): boolean {
  if (hand.cards.length !== 2 || hand.finished || hand.doubled) return false;
  if (hand.splitFromAces && BLACKJACK_RULES.splitAcesReceiveOneCardOnly) return false;
  return true;
}

export function classifyHandTier(cards: BlackjackCard[]): HandTier {
  const total = handValue(cards).total;
  if (total > 21) return "bust";
  if (cards.length >= 5 && total === 21) return "big-five-21";
  if (cards.length >= 5 && total < 21) return "small-five";
  if (isBlackjack(cards)) return "blackjack";
  if (total === 21) return "twenty-one";
  return "points";
}

function tierRank(tier: HandTier): number {
  switch (tier) {
    case "big-five-21":
      return 5;
    case "small-five":
      return 4;
    case "blackjack":
      return 3;
    case "twenty-one":
      return 2;
    case "points":
      return 1;
    default:
      return 0;
  }
}

function payoutForWinningTier(wager: number, tier: HandTier) {
  if (tier === "blackjack") {
    return Math.round(wager * (1 + BLACKJACK_PAYOUT_MULTIPLIER));
  }
  return wager * 2;
}

export function settleHands(params: {
  hands: PlayerHand[];
  dealerCards: BlackjackCard[];
}): { settlements: HandSettlement[]; totalPayout: number } {
  const { hands, dealerCards } = params;
  const dealerTotal = handValue(dealerCards).total;
  const dealerTier = classifyHandTier(dealerCards);
  const dealerRank = tierRank(dealerTier);
  const settlements: HandSettlement[] = [];
  let totalPayout = 0;
  const didSplit = hands.length > 1;

  for (const hand of hands) {
    const playerTotal = handValue(hand.cards).total;
    const playerTier = classifyHandTier(hand.cards);
    const playerRank = tierRank(playerTier);
    let outcome: SettlementOutcome = "lose";
    let payout = 0;

    if (hand.busted || playerTier === "bust") {
      outcome = "lose";
      payout = 0;
    } else {
      if (dealerTier === "bust" || playerRank > dealerRank) {
        outcome = playerTier === "blackjack" ? "blackjack" : "win";
        payout = payoutForWinningTier(hand.wager, playerTier);
      } else if (playerRank < dealerRank) {
        outcome = "lose";
        payout = 0;
      } else if (playerTotal > dealerTotal) {
        // 同 tier 時以點數決勝（例如 small-five 都是 <21）。
        outcome = playerTier === "blackjack" ? "blackjack" : "win";
        payout = payoutForWinningTier(hand.wager, playerTier);
      } else if (playerTotal === dealerTotal) {
        outcome = "push";
        payout = hand.wager;
      } else {
        outcome = "lose";
        payout = 0;
      }
    }

    totalPayout += payout;
    settlements.push({
      handId: hand.id,
      outcome,
      handTier: playerTier,
      payout,
      net: payout - hand.wager,
      finalPlayerTotal: playerTotal,
      finalDealerTotal: dealerTotal,
      didSplit,
      didDouble: hand.doubled,
    });
  }

  return { settlements, totalPayout };
}
