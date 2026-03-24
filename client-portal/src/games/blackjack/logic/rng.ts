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
 * server-seeded 介面 stub：
 * - 目前先用 client 端提供 seed（可用 mock）
 * - 之後可接 API（Supabase Edge Function）回傳 seed / seedHash。
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

export function resolveBlackjackRandomProvider(
  mode: "pseudo" | "server-seeded",
  client?: ServerSeedClient,
): RandomProvider {
  if (mode === "server-seeded" && client) {
    return createServerSeededProvider(client);
  }
  return pseudoRandomProvider;
}
