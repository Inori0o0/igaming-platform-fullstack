/**
 * 轉輪結果的種子隨機數：以 `roundId` 經 xmur3 產生確定性 seed，再用 mulberry32 抽符號。
 * 與 Blackjack/Baccarat 的 `logic/rng.ts` 採同一套演算法，讓「同一 roundId → 同一結果」可重現、可稽核。
 *
 * 目前仍是 `pseudo` 模式（seed 由前端的 roundId 產生），純函式、不依賴 React；
 * 之後若要做到「伺服器端可重算驗證中獎金額」，只需把 `createRoundSeed` 換成
 * 呼叫 Supabase Edge Function 取得伺服器種子（介面預留同 Blackjack `server-seeded`）。
 */
import type { SlotSymbol } from "@/src/games/slots/config";

export type RandomProvider = {
  createRoundSeed: (roundId: string) => number;
};

function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let n = Math.imul(t ^ (t >>> 15), t | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

export const pseudoRandomProvider: RandomProvider = {
  createRoundSeed(roundId) {
    return xmur3(roundId)();
  },
};

/** 依 seed 建立一個可重複呼叫抽符號的產生器（每次呼叫往前推進一步）。 */
export function createSymbolPicker(pool: readonly SlotSymbol[], seed: number) {
  const rng = mulberry32(seed);
  return () => pool[Math.floor(rng() * pool.length)]!;
}

/**
 * 依 `roundId` 產生本局轉輪盤面（確定性：同 roundId + 同 pool → 同結果）。
 * `rows`/`cols` 對應 `SLOT_REEL_ROWS`/`SLOT_REEL_COLS`。
 */
export function randomColumnsForRound(
  pool: readonly SlotSymbol[],
  roundId: string,
  cols: number,
  rows: number,
  provider: RandomProvider = pseudoRandomProvider,
): SlotSymbol[][] {
  const seed = provider.createRoundSeed(roundId);
  const pick = createSymbolPicker(pool, seed);
  return Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => pick()),
  );
}
