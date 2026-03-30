import { describe, expect, it } from "vitest";
import {
  evaluateUnlocks,
  maxNumeric,
  sumNumeric,
  type AchievementStats,
  type AchievementType,
} from "@/src/components/profile/achievements/achievementRules";

function stats(overrides: Partial<AchievementStats> = {}): AchievementStats {
  return {
    totalPlays: 0,
    maxSingleWin: 0,
    orderCount: 0,
    entitlementCount: 0,
    ...overrides,
  };
}

describe("achievementRules", () => {
  it("evaluates all unlocks from stats", () => {
    const result = evaluateUnlocks(
      stats({
        totalPlays: 70,
        maxSingleWin: 12_000,
        orderCount: 1,
        entitlementCount: 5,
      }),
      new Set<AchievementType>(),
    );
    expect(result).toEqual([
      "first_game",
      "lucky_star",
      "first_order",
      "collector",
      "vip_player",
    ]);
  });

  it("skips already unlocked achievements", () => {
    const existing = new Set<AchievementType>(["first_game", "collector"]);
    const result = evaluateUnlocks(
      stats({
        totalPlays: 100,
        maxSingleWin: 10_000,
        orderCount: 2,
        entitlementCount: 10,
      }),
      existing,
    );
    expect(result).toEqual(["lucky_star", "first_order", "vip_player"]);
  });

  it("sumNumeric handles mixed numeric values", () => {
    expect(sumNumeric([100, "25", null, undefined, "x"])).toBe(125);
  });

  it("maxNumeric returns max value or 0", () => {
    expect(maxNumeric([100, "200", "x", null])).toBe(200);
    expect(maxNumeric([null, undefined, "nope"])).toBe(0);
  });
});
