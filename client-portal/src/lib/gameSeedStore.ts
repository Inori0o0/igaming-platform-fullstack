/**
 * Blackjack / Baccarat 開局種子改由伺服器核發（修掉「前端自產種子可被竄改」的問題）：
 * - `issueSeedForRound`：用 Node crypto 產生高強度隨機種子，並附上 SHA-256 承諾雜湊，
 *   讓拿到種子的一方可以自行重算雜湊、確認伺服器回傳的種子沒被中途竄改。
 * - 以 roundId 做冪等：同一 roundId 重複請求一定拿回同一組種子，避免「重骰」攻擊
 *   （例如前端對同一局重送請求想換一個更有利的種子）。
 * - 純記憶體 Map：足夠支撐 demo 規模；正式環境若有多個伺服器實例或需要重啟後仍可稽核，
 *   應把這張表搬進資料庫（例如 Supabase 一張 `game_round_seeds` table）。
 */
import { createHash, randomBytes } from "crypto";

export type IssuedSeed = {
  roundId: string;
  seed: string;
  seedHash: string;
  createdAt: number;
};

const TTL_MS = 30 * 60 * 1000;

const store = new Map<string, IssuedSeed>();

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function cleanupExpired(now: number) {
  for (const [roundId, record] of store) {
    if (now - record.createdAt > TTL_MS) {
      store.delete(roundId);
    }
  }
}

export function issueSeedForRound(roundId: string): IssuedSeed {
  const now = Date.now();
  cleanupExpired(now);

  const existing = store.get(roundId);
  if (existing) return existing;

  const seed = randomBytes(32).toString("hex");
  const record: IssuedSeed = {
    roundId,
    seed,
    seedHash: sha256Hex(seed),
    createdAt: now,
  };
  store.set(roundId, record);
  return record;
}

/** 供稽核/測試使用：確認某個 roundId 先前核發的種子與雜湊確實一致（沒被竄改）。 */
export function verifyIssuedSeed(roundId: string, seed: string): boolean {
  const record = store.get(roundId);
  if (!record) return false;
  return record.seed === seed && record.seedHash === sha256Hex(seed);
}

/** 僅供測試使用，避免不同測試案例互相污染記憶體中的種子表。 */
export function _resetSeedStoreForTests() {
  store.clear();
}
