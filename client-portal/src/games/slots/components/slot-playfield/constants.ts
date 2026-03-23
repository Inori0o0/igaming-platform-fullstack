/**
 * 轉輪版面常數：3 列 × 5 欄；單格預設高度與 `useSlotCellPx` 響應式縮放搭配。
 */

export const SLOT_REEL_ROWS = 3;
export const SLOT_REEL_COLS = 5;
/** 單格高度（轉輪視窗總高 = 列數 × 此值） */
export const SLOT_CELL_PX = 96;

export const SLOT_REEL_WINDOW_H = SLOT_REEL_ROWS * SLOT_CELL_PX;

/** 每欄滾動條長度略不同，讓五欄停輪時間錯開（視覺上較自然）。 */
export function noiseLengthForColumn(columnIndex: number): number {
  return 14 + columnIndex * 3;
}
