import type { Json } from "../database.types";

/** Narrow `Json` RPC payloads to plain objects without `as unknown as`. */
export function asJsonObject(
  data: Json | null | undefined,
): Record<string, Json | undefined> | null {
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    return data;
  }
  return null;
}

/** Parse `{ balance: number }` style wallet RPC results. */
export function parseBalanceRpcResult(data: Json | null | undefined): number | null {
  const obj = asJsonObject(data);
  if (!obj || obj.balance === undefined || obj.balance === null) return null;
  const n = Number(obj.balance);
  return Number.isFinite(n) ? n : null;
}
