import { useAuthStore } from "@/src/store/authStore";
import { STORAGE_KEY_PREFIX, DEFAULT_BALANCES } from "./constants";
import { getStartOfDayIso } from "./numberUtils";
import type { WalletBalances, WalletTransaction } from "./types";

export function buildStorageKey(identityId: string) {
  // 以 userId 區分儲存 key，避免不同帳號（含訪客）互相覆蓋錢包資料。
  return `${STORAGE_KEY_PREFIX}:${identityId}`;
}

export function getCurrentUser() {
  return useAuthStore.getState().user ?? null;
}

export function getCurrentGuestId() {
  const user = getCurrentUser();
  if (!user || !user.is_guest) return null;
  return user.id;
}

export function createTransaction(
  partial: Omit<WalletTransaction, "id" | "createdAt">,
): WalletTransaction {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

export function loadLocalWallet(identityId: string): {
  balances: WalletBalances;
  transactions: WalletTransaction[];
} {
  if (typeof window === "undefined") {
    return { balances: DEFAULT_BALANCES, transactions: [] };
  }

  const raw = window.localStorage.getItem(buildStorageKey(identityId));
  if (!raw) {
    return { balances: DEFAULT_BALANCES, transactions: [] };
  }

  try {
    const parsed = JSON.parse(raw) as {
      balances?: WalletBalances;
      transactions?: WalletTransaction[];
    };
    return {
      balances: parsed.balances ?? DEFAULT_BALANCES,
      transactions: parsed.transactions ?? [],
    };
  } catch {
    return { balances: DEFAULT_BALANCES, transactions: [] };
  }
}

export function persistLocalWallet(
  identityId: string | null,
  balances: WalletBalances,
  transactions: WalletTransaction[],
) {
  if (!identityId || typeof window === "undefined") return;
  window.localStorage.setItem(
    buildStorageKey(identityId),
    JSON.stringify({ balances, transactions }),
  );
}

export function getLocalClaimStats(transactions: WalletTransaction[]) {
  const startOfDayMs = new Date(getStartOfDayIso()).getTime();
  let todayCount = 0;
  let lastClaimAtMs: number | null = null;

  for (const tx of transactions) {
    if (tx.type !== "claim") continue;
    const txMs = new Date(tx.createdAt).getTime();
    if (txMs >= startOfDayMs) todayCount += 1;
    if (lastClaimAtMs === null || txMs > lastClaimAtMs) {
      lastClaimAtMs = txMs;
    }
  }

  return { todayCount, lastClaimAtMs };
}

export function getLocalDepositStats(transactions: WalletTransaction[]) {
  const startOfDayMs = new Date(getStartOfDayIso()).getTime();
  const thresholdMs = Date.now() - 60_000;
  let minuteCount = 0;
  let todayAmount = 0;

  for (const tx of transactions) {
    if (tx.type !== "deposit") continue;
    const txMs = new Date(tx.createdAt).getTime();
    if (txMs >= thresholdMs) minuteCount += 1;
    if (txMs >= startOfDayMs) todayAmount += tx.amount;
  }

  return { minuteCount, todayAmount };
}
