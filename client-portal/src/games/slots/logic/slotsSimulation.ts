import type { SlotThemeConfig } from "../config/types";
import { SLOT_GRID } from "../config/types";
import { evaluateLineWins } from "./evaluateLineWins";
import { randomColumnsForRound } from "./rng";

const { cols: SLOT_COLS, rows: SLOT_ROWS } = SLOT_GRID;

/** 以固定 roundId 序列模擬 N 局，回傳 RTP（派彩 / 總下注）。 */
export function simulateThemeRtp(
  theme: SlotThemeConfig,
  spinCount: number,
  roundIdPrefix: string,
  totalBet = theme.betting.defaultBet,
): number {
  let totalPayout = 0;
  for (let i = 0; i < spinCount; i += 1) {
    const columns = randomColumnsForRound(
      theme.symbols,
      `${roundIdPrefix}-${i}`,
      SLOT_COLS,
      SLOT_ROWS,
    );
    const result = evaluateLineWins(columns, theme, { totalBet });
    totalPayout += result.totalCredits;
  }
  return totalPayout / (spinCount * totalBet);
}

/** 卡方統計量：檢驗符號出現次數是否接近均勻分佈。 */
export function chiSquareUniform(counts: readonly number[]): number {
  const total = counts.reduce((sum, n) => sum + n, 0);
  if (total === 0) return 0;
  const expected = total / counts.length;
  return counts.reduce((sum, observed) => {
    const diff = observed - expected;
    return sum + (diff * diff) / expected;
  }, 0);
}
