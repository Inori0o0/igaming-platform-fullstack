import { describe, expect, it } from "vitest";
import type { SlotSymbol } from "@/src/games/slots/config";
import { randomColumnsForRound } from "./rng";

const pool: SlotSymbol[] = [
  { id: "a", display: "A", name: "A" },
  { id: "b", display: "B", name: "B" },
  { id: "c", display: "C", name: "C" },
];

describe("randomColumnsForRound", () => {
  it("同一 roundId 一定產生同一盤面（確定性，可重現/可稽核）", () => {
    const a = randomColumnsForRound(pool, "round-123", 5, 3);
    const b = randomColumnsForRound(pool, "round-123", 5, 3);
    expect(a).toEqual(b);
  });

  it("不同 roundId 通常產生不同盤面", () => {
    const a = randomColumnsForRound(pool, "round-abc", 5, 3);
    const b = randomColumnsForRound(pool, "round-xyz", 5, 3);
    expect(a).not.toEqual(b);
  });

  it("回傳的欄數/列數與參數一致，且每格都來自傳入的符號池", () => {
    const cols = 5;
    const rows = 3;
    const result = randomColumnsForRound(pool, "round-shape", cols, rows);
    expect(result).toHaveLength(cols);
    for (const column of result) {
      expect(column).toHaveLength(rows);
      for (const symbol of column) {
        expect(pool).toContainEqual(symbol);
      }
    }
  });
});
