/**
 * `gameSeedStore` 的核心安全性質：
 * - 種子必須是隨機且與 SHA-256 雜湊一致（可稽核）
 * - 同一 roundId 重複請求要拿回同一組種子（冪等，防「重骰」）
 * - 不同 roundId 要拿到不同種子
 */
import { createHash } from "crypto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  _resetSeedStoreForTests,
  issueSeedForRound,
  verifyIssuedSeed,
} from "./gameSeedStore";

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

beforeEach(() => {
  _resetSeedStoreForTests();
});

describe("issueSeedForRound", () => {
  it("issues a seed whose hash matches the returned seedHash", () => {
    const { seed, seedHash } = issueSeedForRound("round-1");
    expect(seedHash).toBe(sha256Hex(seed));
  });

  it("is idempotent for the same roundId", () => {
    const first = issueSeedForRound("round-2");
    const second = issueSeedForRound("round-2");
    expect(second.seed).toBe(first.seed);
    expect(second.seedHash).toBe(first.seedHash);
  });

  it("issues different seeds for different roundIds", () => {
    const a = issueSeedForRound("round-a");
    const b = issueSeedForRound("round-b");
    expect(a.seed).not.toBe(b.seed);
  });

  it("issues seeds with enough entropy (32 random bytes as hex)", () => {
    const { seed } = issueSeedForRound("round-entropy");
    expect(seed).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("verifyIssuedSeed", () => {
  it("returns true for a seed that matches what was issued", () => {
    const { seed } = issueSeedForRound("round-verify");
    expect(verifyIssuedSeed("round-verify", seed)).toBe(true);
  });

  it("returns false for a tampered seed", () => {
    issueSeedForRound("round-tamper");
    expect(verifyIssuedSeed("round-tamper", "deadbeef")).toBe(false);
  });

  it("returns false for an unknown roundId", () => {
    expect(verifyIssuedSeed("never-issued", "deadbeef")).toBe(false);
  });
});
