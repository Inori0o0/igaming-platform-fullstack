import { describe, expect, it } from "vitest";
import {
  buildHistoryRow,
  dateRangeIso,
  gameLabelById,
  sumWinAmount,
  toNumber,
} from "@/src/components/profile/history/historyUtils";

describe("historyUtils", () => {
  describe("toNumber", () => {
    it("converts number and numeric string", () => {
      expect(toNumber(12)).toBe(12);
      expect(toNumber("34")).toBe(34);
      expect(toNumber("12.5")).toBe(12.5);
    });

    it("returns 0 for nullish or invalid values", () => {
      expect(toNumber(null)).toBe(0);
      expect(toNumber(undefined)).toBe(0);
      expect(toNumber("abc")).toBe(0);
    });
  });

  describe("gameLabelById", () => {
    it("maps known game ids", () => {
      expect(gameLabelById("slots")).toBe("Slots");
      expect(gameLabelById("blackjack")).toBe("Blackjack");
      expect(gameLabelById("baccarat")).toBe("Baccarat");
    });

    it("falls back for unknown game ids", () => {
      expect(gameLabelById("lottery")).toBe("其他");
      expect(gameLabelById(null)).toBe("其他");
    });
  });

  describe("dateRangeIso", () => {
    it("creates one-day range with 24h span", () => {
      const { startIso, endIso } = dateRangeIso("2026-03-30");
      const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
      expect(diffMs).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe("buildHistoryRow", () => {
    it("maps row fields and reads bet from metadata.totalBet", () => {
      const row = buildHistoryRow({
        id: "tx-1",
        game_id: "slots",
        theme_id: "classic",
        round_id: "round-1",
        amount: "888",
        created_at: "2026-03-30T12:00:00.000Z",
        metadata: { totalBet: "67" },
      });

      expect(row).toEqual({
        id: "tx-1",
        gameId: "slots",
        gameLabel: "Slots",
        themeId: "classic",
        roundId: "round-1",
        betAmount: 67,
        winAmount: 888,
        createdAt: "2026-03-30T12:00:00.000Z",
      });
    });

    it("defaults bet to 0 when metadata missing", () => {
      const row = buildHistoryRow({
        id: "tx-2",
        game_id: null,
        theme_id: null,
        round_id: null,
        amount: 0,
        created_at: "2026-03-30T12:00:00.000Z",
        metadata: null,
      });
      expect(row.betAmount).toBe(0);
      expect(row.gameLabel).toBe("其他");
    });
  });

  describe("sumWinAmount", () => {
    it("sums payout amounts as total win", () => {
      const total = sumWinAmount([
        { amount: 100 },
        { amount: "250" },
        { amount: null },
      ]);
      expect(total).toBe(350);
    });
  });
});
