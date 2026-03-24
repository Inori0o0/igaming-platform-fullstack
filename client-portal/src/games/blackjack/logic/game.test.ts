/**
 * `game.ts` 規則單元測試：點數、莊家補牌、分牌／雙倍條件、結算與過五關階級。
 */
import { describe, expect, it } from "vitest";
import {
  canDoubleDown,
  canSplit,
  classifyHandTier,
  handValue,
  settleHands,
  shouldDealerHit,
} from "./game";
import type { BlackjackCard, PlayerHand } from "./types";

function card(rank: BlackjackCard["rank"], suit: BlackjackCard["suit"]): BlackjackCard {
  return { rank, suit };
}

function makeHand(params: Partial<PlayerHand> & Pick<PlayerHand, "cards" | "wager">): PlayerHand {
  return {
    id: "h1",
    cards: params.cards,
    wager: params.wager,
    doubled: params.doubled ?? false,
    splitFromAces: params.splitFromAces ?? false,
    stood: params.stood ?? false,
    busted: params.busted ?? false,
    blackjack: params.blackjack ?? false,
    finished: params.finished ?? false,
    result: params.result ?? "playing",
  };
}

describe("blackjack handValue", () => {
  it("counts soft hand with ace as 11", () => {
    const result = handValue([card("A", "S"), card("6", "H")]);
    expect(result.total).toBe(17);
    expect(result.soft).toBe(true);
  });

  it("converts ace to 1 when needed", () => {
    const result = handValue([card("A", "S"), card("9", "H"), card("8", "D")]);
    expect(result.total).toBe(18);
    expect(result.soft).toBe(false);
  });
});

describe("blackjack dealer rule S17", () => {
  it("stands on soft 17", () => {
    const dealer = [card("A", "S"), card("6", "H")];
    expect(shouldDealerHit(dealer)).toBe(false);
  });

  it("hits below 17", () => {
    const dealer = [card("8", "S"), card("8", "H")];
    expect(shouldDealerHit(dealer)).toBe(true);
  });
});

describe("blackjack settlement", () => {
  it("pays 3:2 for player blackjack", () => {
    const hands = [
      makeHand({
        cards: [card("A", "S"), card("K", "H")],
        wager: 200,
        blackjack: true,
        finished: true,
        result: "blackjack",
      }),
    ];
    const result = settleHands({
      hands,
      dealerCards: [card("10", "S"), card("8", "H")],
    });
    expect(result.totalPayout).toBe(500);
    expect(result.settlements[0]?.outcome).toBe("blackjack");
  });

  it("returns push when totals tie", () => {
    const hands = [
      makeHand({
        cards: [card("10", "S"), card("8", "H")],
        wager: 200,
        stood: true,
        finished: true,
        result: "stand",
      }),
    ];
    const result = settleHands({
      hands,
      dealerCards: [card("9", "D"), card("9", "C")],
    });
    expect(result.totalPayout).toBe(200);
    expect(result.settlements[0]?.outcome).toBe("push");
  });

  it("supports split and double outcomes independently", () => {
    const hands = [
      makeHand({
        id: "left",
        cards: [card("10", "S"), card("K", "H")],
        wager: 400,
        doubled: true,
        stood: true,
        finished: true,
        result: "stand",
      }),
      makeHand({
        id: "right",
        cards: [card("8", "D"), card("8", "C"), card("9", "H")],
        wager: 200,
        busted: true,
        finished: true,
        result: "bust",
      }),
    ];
    const result = settleHands({
      hands,
      dealerCards: [card("10", "D"), card("7", "S")],
    });
    expect(result.totalPayout).toBe(800);
    expect(result.settlements).toHaveLength(2);
    expect(result.settlements[0]?.didDouble).toBe(true);
    expect(result.settlements[0]?.didSplit).toBe(true);
    expect(result.settlements[1]?.outcome).toBe("lose");
  });

  it("treats five-card 21 as highest tier win", () => {
    const hands = [
      makeHand({
        cards: [
          card("A", "S"),
          card("3", "H"),
          card("4", "D"),
          card("5", "C"),
          card("8", "H"),
        ],
        wager: 200,
        finished: true,
        result: "stand",
      }),
    ];
    const result = settleHands({
      hands,
      dealerCards: [card("A", "D"), card("K", "S")],
    });
    expect(result.settlements[0]?.handTier).toBe("big-five-21");
    expect(result.settlements[0]?.outcome).toBe("win");
  });

  it("classifies five-card under 21 correctly", () => {
    const tier = classifyHandTier([
      card("2", "S"),
      card("3", "H"),
      card("4", "D"),
      card("5", "C"),
      card("6", "H"),
    ]);
    expect(tier).toBe("small-five");
  });
});

describe("canSplit", () => {
  it("allows split only for equal pair on active hand", () => {
    expect(
      canSplit(
        makeHand({
          cards: [card("8", "S"), card("8", "H")],
          wager: 200,
        }),
      ),
    ).toBe(true);
    expect(
      canSplit(
        makeHand({
          cards: [card("8", "S"), card("9", "H")],
          wager: 200,
        }),
      ),
    ).toBe(false);
  });

  it("blocks split when reached max hands", () => {
    expect(
      canSplit(
        makeHand({
          cards: [card("8", "S"), card("8", "H")],
          wager: 200,
        }),
        { handsCount: 4, maxHandsAfterSplit: 4 },
      ),
    ).toBe(false);
  });
});

describe("canDoubleDown", () => {
  it("blocks double when hand comes from split aces lock", () => {
    expect(
      canDoubleDown(
        makeHand({
          cards: [card("A", "S"), card("9", "H")],
          wager: 200,
          splitFromAces: true,
        }),
      ),
    ).toBe(false);
  });
});
