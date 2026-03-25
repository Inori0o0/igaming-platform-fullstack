/**
 * `game.ts` 單元測試：計點、天牌、第三張規則、結算（含和局 Push、莊 0.95）。
 */
import { describe, expect, it } from "vitest";
import {
  baccaratCardValue,
  baccaratTotal,
  decideOutcome,
  isNatural,
  settleWager,
  shouldBankerDrawThird,
  shouldPlayerDrawThird,
} from "./game";
import type { BlackjackCard } from "@/src/games/blackjack/logic/types";

function card(rank: BlackjackCard["rank"], suit: BlackjackCard["suit"]): BlackjackCard {
  return { rank, suit };
}

describe("baccaratCardValue", () => {
  it("maps face cards and 10 to zero", () => {
    expect(baccaratCardValue("10")).toBe(0);
    expect(baccaratCardValue("J")).toBe(0);
    expect(baccaratCardValue("Q")).toBe(0);
    expect(baccaratCardValue("K")).toBe(0);
  });

  it("maps ace to one and numeric ranks to value", () => {
    expect(baccaratCardValue("A")).toBe(1);
    expect(baccaratCardValue("7")).toBe(7);
  });
});

describe("baccaratTotal", () => {
  it("uses modulo 10", () => {
    const total = baccaratTotal([card("9", "S"), card("8", "H"), card("7", "D")]); // 24 -> 4
    expect(total).toBe(4);
  });
});

describe("natural and outcome", () => {
  it("detects natural when either side is 8 or 9", () => {
    expect(isNatural([card("9", "S"), card("K", "H")], [card("4", "D"), card("3", "C")])).toBe(true);
    expect(isNatural([card("4", "S"), card("2", "H")], [card("3", "D"), card("3", "C")])).toBe(false);
  });

  it("decides player / banker / tie outcomes", () => {
    expect(decideOutcome([card("9", "S"), card("K", "H")], [card("4", "D"), card("3", "C")])).toBe("player");
    expect(decideOutcome([card("2", "S"), card("2", "H")], [card("6", "D"), card("2", "C")])).toBe("banker");
    expect(decideOutcome([card("7", "S"), card("2", "H")], [card("5", "D"), card("4", "C")])).toBe("tie");
  });
});

describe("third-card rules", () => {
  it("player draws on 0-5, stands on 6-7", () => {
    expect(shouldPlayerDrawThird([card("2", "S"), card("3", "H")])).toBe(true); // 5
    expect(shouldPlayerDrawThird([card("3", "S"), card("3", "H")])).toBe(false); // 6
  });

  it("banker rule when player stands (null third value)", () => {
    expect(shouldBankerDrawThird({ bankerCards: [card("2", "S"), card("3", "H")], playerThirdValue: null })).toBe(true); // 5
    expect(shouldBankerDrawThird({ bankerCards: [card("4", "S"), card("3", "H")], playerThirdValue: null })).toBe(false); // 7
  });

  it("banker table cases with player third card", () => {
    // banker total 3 draws unless player third is 8
    expect(shouldBankerDrawThird({ bankerCards: [card("A", "S"), card("2", "H")], playerThirdValue: 8 })).toBe(false);
    expect(shouldBankerDrawThird({ bankerCards: [card("A", "S"), card("2", "H")], playerThirdValue: 7 })).toBe(true);

    // banker total 6 draws only on player third 6 or 7
    expect(shouldBankerDrawThird({ bankerCards: [card("4", "S"), card("2", "H")], playerThirdValue: 6 })).toBe(true);
    expect(shouldBankerDrawThird({ bankerCards: [card("4", "S"), card("2", "H")], playerThirdValue: 5 })).toBe(false);
  });
});

describe("settleWager", () => {
  it("pays player win at 2x total payout", () => {
    const settled = settleWager({ wager: 100, betArea: "player", outcome: "player" });
    expect(settled.payout).toBe(200);
    expect(settled.isPush).toBe(false);
  });

  it("pays banker win at 1.95x total payout with rounding", () => {
    const settled = settleWager({ wager: 100, betArea: "banker", outcome: "banker" });
    expect(settled.payout).toBe(195);
    expect(settled.isPush).toBe(false);
  });

  it("returns push on tie for non-tie bet", () => {
    const settled = settleWager({ wager: 300, betArea: "player", outcome: "tie" });
    expect(settled.payout).toBe(300);
    expect(settled.isPush).toBe(true);
  });

  it("pays tie at 9x total payout", () => {
    const settled = settleWager({ wager: 100, betArea: "tie", outcome: "tie" });
    expect(settled.payout).toBe(900);
    expect(settled.isPush).toBe(false);
  });
});

