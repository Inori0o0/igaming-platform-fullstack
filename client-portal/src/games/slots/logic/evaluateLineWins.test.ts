import { describe, expect, it } from "vitest";
import type { SlotSymbol, SlotThemeConfig } from "@/src/games/slots/config";
import { SLOT_GRID } from "@/src/games/slots/config";
import { evaluateLineWins } from "./evaluateLineWins";

const symA: SlotSymbol = { id: "a", display: "A", name: "A" };
const symB: SlotSymbol = { id: "b", display: "B", name: "B" };
const symC: SlotSymbol = { id: "c", display: "C", name: "C" };

const baseTheme: SlotThemeConfig = {
  id: "cyber-neon",
  headline: "test",
  tagline: "test",
  grid: SLOT_GRID,
  symbols: [symA, symB, symC],
  paylines: [
    [1, 1, 1, 1, 1], // middle
    [0, 0, 0, 0, 0], // top
    [2, 2, 2, 2, 2], // bottom
  ],
  paytable: [
    { symbolId: "a", count: 3, multiplier: 2 },
    { symbolId: "a", count: 4, multiplier: 4 },
    { symbolId: "a", count: 5, multiplier: 10 },
    { symbolId: "b", count: 3, multiplier: 1 },
    { symbolId: "b", count: 4, multiplier: 2 },
    { symbolId: "b", count: 5, multiplier: 3 },
  ],
  visual: {
    shellGradient: "",
    shellBorder: "",
    reelFrame: "",
    cellSurface: "",
    symbolText: "",
    accentText: "",
    mutedText: "",
    buttonPrimary: "",
    buttonPrimaryHover: "",
    glitchIntensity: 0,
  },
  betting: {
    defaultBet: 90,
    step: 10,
    min: 10,
    max: 500,
  },
  featureIds: [],
  meta: { status: "active" },
};

describe("evaluateLineWins", () => {
  it("returns zero when no payline has 3+ left contiguous symbols", () => {
    const columns = [
      [symA, symB, symC],
      [symB, symC, symA],
      [symC, symA, symB],
      [symB, symC, symA],
      [symC, symA, symB],
    ] as const;

    const result = evaluateLineWins(columns, baseTheme, {
      totalBet: 90,
    });

    expect(result.lineWins).toHaveLength(0);
    expect(result.totalCredits).toBe(0);
    expect(result.betPerLine).toBe(30);
  });

  it("evaluates multiple lines with totalBet split by all paylines", () => {
    const columns = [
      [symB, symA, symC],
      [symB, symA, symC],
      [symB, symA, symC],
      [symB, symA, symC],
      [symB, symA, symC],
    ] as const;

    const result = evaluateLineWins(columns, baseTheme, {
      totalBet: 100,
    });

    // middle A x5 => 10x, top B x5 => 3x, each line bet = 100 / 3
    expect(result.betPerLine).toBeCloseTo(33.3333, 3);
    expect(result.lineWins).toHaveLength(2);
    expect(result.totalCredits).toBeCloseTo((10 + 3) * (100 / 3), 6);
  });

  it("only checks left-to-right contiguous run", () => {
    const columns = [
      [symC, symA, symB],
      [symC, symA, symB],
      [symC, symB, symB], // break middle line here
      [symC, symA, symB],
      [symC, symA, symB],
    ] as const;

    const result = evaluateLineWins(columns, baseTheme, {
      totalBet: 90,
    });

    // middle line broken at col 2 => run length only 2 (no payout)
    expect(result.lineWins.some((w) => w.symbolId === "a")).toBe(false);
    // bottom line B x5 still wins
    expect(result.lineWins.some((w) => w.symbolId === "b")).toBe(true);
  });
});
