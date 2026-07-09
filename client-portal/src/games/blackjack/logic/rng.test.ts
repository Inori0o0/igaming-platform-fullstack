/**
 * `rng.ts` 的種子/洗牌邏輯：
 * - pseudo 模式對同一 roundId 要能重現同一個洗牌結果（確定性）。
 * - server-seeded 模式要透過注入的 `ServerSeedClient` 取得 seed，而不是自己用 roundId 算。
 * - `resolveBlackjackRandomProvider("server-seeded")` 沒帶 client 時要直接丟錯，而不是靜默退回 pseudo。
 */
import { describe, expect, it, vi } from "vitest";
import {
  buildStandardDeck,
  pseudoRandomProvider,
  resolveBlackjackRandomProvider,
  type ServerSeedClient,
} from "./rng";

describe("pseudoRandomProvider", () => {
  it("produces the same shuffle for the same roundId", async () => {
    const roundId = "same-round-id";
    const seedA = await pseudoRandomProvider.createRoundSeed(roundId);
    const seedB = await pseudoRandomProvider.createRoundSeed(roundId);
    expect(seedA).toBe(seedB);

    const deckA = pseudoRandomProvider.shuffleDeck(buildStandardDeck(), seedA);
    const deckB = pseudoRandomProvider.shuffleDeck(buildStandardDeck(), seedB);
    expect(deckA).toEqual(deckB);
  });

  it("produces a full 52-card deck without duplicates", () => {
    const deck = pseudoRandomProvider.shuffleDeck(buildStandardDeck(), 42);
    expect(deck).toHaveLength(52);
    const unique = new Set(deck.map((c) => `${c.rank}${c.suit}`));
    expect(unique.size).toBe(52);
  });
});

describe("resolveBlackjackRandomProvider", () => {
  it("throws when server-seeded mode is requested without a client", () => {
    expect(() => resolveBlackjackRandomProvider("server-seeded")).toThrow();
  });

  it("delegates seed creation to the injected ServerSeedClient", async () => {
    const getSeed = vi.fn(async (roundId: string) => ({
      seed: roundId.length * 1000,
      seedHash: "mock-hash",
    }));
    const client: ServerSeedClient = { getSeed };

    const provider = resolveBlackjackRandomProvider("server-seeded", client);
    const seed = await provider.createRoundSeed("abcd");

    expect(getSeed).toHaveBeenCalledWith("abcd");
    expect(seed).toBe(4000);
  });

  it("returns the pseudo provider for pseudo mode", () => {
    const provider = resolveBlackjackRandomProvider("pseudo");
    expect(provider).toBe(pseudoRandomProvider);
  });
});
