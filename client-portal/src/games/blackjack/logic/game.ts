import type {
  BlackjackCard,
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
  return cards.length === 2 && handValue(cards).total === 21;
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

export function settleHands(params: {
  hands: PlayerHand[];
  dealerCards: BlackjackCard[];
}): { settlements: HandSettlement[]; totalPayout: number } {
  const { hands, dealerCards } = params;
  const dealer = handValue(dealerCards);
  const dealerTotal = dealer.total;
  const dealerBust = dealerTotal > 21;
  const settlements: HandSettlement[] = [];
  let totalPayout = 0;
  const didSplit = hands.length > 1;

  for (const hand of hands) {
    const player = handValue(hand.cards);
    const playerTotal = player.total;
    let outcome: SettlementOutcome = "lose";
    let payout = 0;

    if (hand.busted || playerTotal > 21) {
      outcome = "lose";
      payout = 0;
    } else if (hand.blackjack && !isBlackjack(dealerCards)) {
      outcome = "blackjack";
      payout = Math.round(hand.wager * (1 + BLACKJACK_PAYOUT_MULTIPLIER));
    } else if (isBlackjack(dealerCards) && !hand.blackjack) {
      outcome = "lose";
      payout = 0;
    } else if (hand.blackjack && isBlackjack(dealerCards)) {
      outcome = "push";
      payout = hand.wager;
    } else if (dealerBust) {
      outcome = "win";
      payout = hand.wager * 2;
    } else if (playerTotal > dealerTotal) {
      outcome = "win";
      payout = hand.wager * 2;
    } else if (playerTotal === dealerTotal) {
      outcome = "push";
      payout = hand.wager;
    } else {
      outcome = "lose";
      payout = 0;
    }

    totalPayout += payout;
    settlements.push({
      handId: hand.id,
      outcome,
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
