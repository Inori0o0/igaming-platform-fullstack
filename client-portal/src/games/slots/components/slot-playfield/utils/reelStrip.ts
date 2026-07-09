/**
 * 轉輪「紙帶」資料：可重現初始盤面、以及動畫用長條 strip（上方雜訊 + 最後三格為本局結果）。
 * 本局結果一律由 `logic/rng.ts` 的 `randomColumnsForRound(pool, roundId, ...)` 依 roundId 決定性產生，
 * 這裡不再提供 `Math.random()` 版本的抽符號函式，避免每次呼叫都是不可重現、無法稽核的結果。
 */
import type { SlotSymbol } from "@/src/games/slots/config";
import { SLOT_REEL_COLS, SLOT_REEL_ROWS } from "./constants";

export function symbolByIndex(
  pool: readonly SlotSymbol[],
  index: number,
): SlotSymbol {
  return pool[((index % pool.length) + pool.length) % pool.length]!;
}

/**
 * 組成一條垂直符號列：前段為滾動用「雜訊」，最後 `SLOT_REEL_ROWS` 格必須是該欄本局結果。
 * `seed` 讓每次 spin 雜訊圖樣可變（搭配 spinToken）。
 */
export function buildStrip(
  pool: readonly SlotSymbol[],
  finalTriplet: readonly SlotSymbol[],
  noiseLength: number,
  seed: number,
): SlotSymbol[] {
  const noise = Array.from({ length: noiseLength }, (_, idx) =>
    symbolByIndex(pool, seed + idx),
  );
  return [...noise, ...finalTriplet];
}

/** SSR/hydrate 安全：初始盤面可重現。 */
export function buildInitialColumns(pool: readonly SlotSymbol[]): SlotSymbol[][] {
  return Array.from({ length: SLOT_REEL_COLS }, (_, col) =>
    Array.from({ length: SLOT_REEL_ROWS }, (_, row) =>
      symbolByIndex(pool, col * 7 + row * 3),
    ),
  );
}

