/**
 * 洗牌與種子：以 roundId（或伺服器種子）經 xmur3 產生確定性 seed，再用 Fisher–Yates 洗牌。
 * `server-seeded` 模式已接上 /api/games/seed（見 src/lib/gameSeedClient.ts）：種子改由伺服器產生，
 * 前端不再能透過操控 roundId 來左右洗牌結果；`pseudo` 僅保留給測試/離線環境使用。
 */
import type { BlackjackCard, Rank, Suit } from "./types";

const SUITS: Suit[] = ["S", "H", "D", "C"];
const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export type RandomProvider = {
  createRoundSeed: (roundId: string) => Promise<number> | number;
  shuffleDeck: (deck: BlackjackCard[], seed: number) => BlackjackCard[];
};

export type ServerSeedClient = {
  getSeed: (roundId: string) => Promise<{ seed: number; seedHash?: string }>;
};

/** 匯出供 `src/lib/gameSeedClient.ts` 把伺服器回傳的 hex 種子字串轉成可餵給 mulberry32 的數字種子。 */
export function xmur3(str: string) {
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

export function buildStandardDeck(): BlackjackCard[] {
  const deck: BlackjackCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export const pseudoRandomProvider: RandomProvider = {
  createRoundSeed(roundId) {
    return xmur3(roundId)();
  },
  shuffleDeck(deck, seed) {
    const rng = mulberry32(seed);
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  },
};

/**
 * server-seeded：seed 改由後端 `/api/games/seed` 核發（見 `src/lib/gameSeedClient.ts`），
 * 前端只負責用拿到的 seed 洗牌，無法再自己決定/竄改洗出來的結果。
 */
export function createServerSeededProvider(client: ServerSeedClient): RandomProvider {
  return {
    async createRoundSeed(roundId) {
      const { seed } = await client.getSeed(roundId);
      return seed;
    },
    shuffleDeck(deck, seed) {
      return pseudoRandomProvider.shuffleDeck(deck, seed);
    },
  };
}

/**
 * `server-seeded` 模式若沒帶 client 直接丟錯，而不是靜默退回 `pseudo`——
 * 避免「忘了傳 client」這種設定疏失，讓遊戲在使用者無感的情況下退回不安全的前端種子模式。
 */
export function resolveBlackjackRandomProvider(
  mode: "pseudo" | "server-seeded",
  client?: ServerSeedClient,
): RandomProvider {
  if (mode === "server-seeded") {
    if (!client) {
      throw new Error("server-seeded 模式需要提供 ServerSeedClient。");
    }
    return createServerSeededProvider(client);
  }
  return pseudoRandomProvider;
}
