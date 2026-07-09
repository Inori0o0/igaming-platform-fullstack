/**
 * 前端呼叫 `/api/games/seed` 取得伺服器核發的洗牌種子，並用 Web Crypto 重算 SHA-256，
 * 比對伺服器一併回傳的 seedHash——確保種子在傳輸過程沒被竄改。
 * 任何一步失敗都直接 throw，交給呼叫端（開局流程）中止本局並提示玩家，
 * 而不是悄悄退回到前端自產種子（那正是這次要修掉的安全問題）。
 */
import { xmur3, type ServerSeedClient } from "@/src/games/blackjack/logic/rng";

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const httpServerSeedClient: ServerSeedClient = {
  async getSeed(roundId) {
    const res = await fetch("/api/games/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId }),
    });
    if (!res.ok) {
      throw new Error(`取得伺服器種子失敗（HTTP ${res.status}）`);
    }

    const body = (await res.json()) as { seed?: string; seedHash?: string };
    if (!body.seed || !body.seedHash) {
      throw new Error("伺服器種子回應格式錯誤");
    }

    const recomputedHash = await sha256Hex(body.seed);
    if (recomputedHash !== body.seedHash) {
      throw new Error("伺服器種子雜湊驗證失敗，本局已中止");
    }

    return { seed: xmur3(body.seed)(), seedHash: body.seedHash };
  },
};
