import { describe, expect, it } from "vitest";
import type { SlotSymbol, SlotThemeConfig } from "@/src/games/slots/config";
import { SLOT_GRID } from "@/src/games/slots/config";
import { cyberNeonTheme } from "@/src/games/slots/config/themes/cyber-neon";
import { italianBrainrotTheme } from "@/src/games/slots/config/themes/italian-brainrot";
import { vacantClassicTheme } from "@/src/games/slots/config/themes/vacant-classic";
import { randomColumnsForRound } from "./rng";
import { chiSquareUniform, simulateThemeRtp } from "./slotsSimulation";

function countSymbolFrequency(
  pool: readonly SlotSymbol[],
  spinCount: number,
  roundIdPrefix: string,
): number[] {
  const { cols: SLOT_COLS, rows: SLOT_ROWS } = SLOT_GRID;
  const counts = new Map(pool.map((symbol) => [symbol.id, 0]));
  for (let i = 0; i < spinCount; i += 1) {
    const columns = randomColumnsForRound(
      pool,
      `${roundIdPrefix}-${i}`,
      SLOT_COLS,
      SLOT_ROWS,
    );
    for (const column of columns) {
      for (const symbol of column) {
        counts.set(symbol.id, (counts.get(symbol.id) ?? 0) + 1);
      }
    }
  }
  return pool.map((symbol) => counts.get(symbol.id) ?? 0);
}

/**
 * 各主題在 50k 局、defaultBet 下的實測 RTP 基準（2026-07 校準）。
 * 作為回歸護欄：paytable / RNG 邏輯變動時測試會失敗，提醒重新校準。
 */
const THEME_RTP_BASELINES: Record<SlotThemeConfig["id"], number> = {
  "cyber-neon": 0.237236,
  "vacant-classic": 0.187096,
  "italian-brainrot": 0.185952,
};

const RTP_SPIN_COUNT = 50_000;
const RTP_TOLERANCE = 0.03;
const SYMBOL_SPIN_COUNT = 12_000;
/** 6 符號均勻分佈，df=5，α=0.01 臨界值 ≈ 15.09 */
const CHI_SQUARE_CRITICAL_6_SYMBOLS = 15.09;

describe("slots payout distribution", () => {
  it("符號出現頻率接近均勻分佈（卡方檢定）", () => {
    const pool = cyberNeonTheme.symbols;
    const counts = countSymbolFrequency(pool, SYMBOL_SPIN_COUNT, "chi-square-cyber-neon");
    const chiSq = chiSquareUniform(counts);

    expect(chiSq).toBeLessThan(CHI_SQUARE_CRITICAL_6_SYMBOLS);
  });

  it.each([
    ["cyber-neon", cyberNeonTheme],
    ["vacant-classic", vacantClassicTheme],
    ["italian-brainrot", italianBrainrotTheme],
  ] as const)("主題 %s 的實測 RTP 落在設計基準 ±%.0f%% 內", (themeId, theme) => {
    const baseline = THEME_RTP_BASELINES[themeId];
    expect(baseline).toBeGreaterThan(0);

    const observedRtp = simulateThemeRtp(theme, RTP_SPIN_COUNT, `rtp-${themeId}`);
    expect(observedRtp).toBeGreaterThanOrEqual(baseline - RTP_TOLERANCE);
    expect(observedRtp).toBeLessThanOrEqual(baseline + RTP_TOLERANCE);
  });

  it("任一主題的實測 RTP 不會極端偏高（>150%）或偏低（<5%）", () => {
    const themes = [cyberNeonTheme, vacantClassicTheme, italianBrainrotTheme];
    for (const theme of themes) {
      const rtp = simulateThemeRtp(theme, 8_000, `rtp-sanity-${theme.id}`);
      expect(rtp).toBeGreaterThan(0.05);
      expect(rtp).toBeLessThan(1.5);
    }
  });
});
