"use client";

import { create } from "zustand";
import { useAuthStore } from "@/src/store/authStore";

export type WalletCurrency = "VAC" | "BTC" | "ETH";
export type TransactionType = "deposit" | "withdraw" | "claim";
export type TransactionStatus = "completed" | "pending";

export type WalletBalances = {
  VAC: number;
  BTC: number;
  ETH: number;
};

export type WalletTransaction = {
  id: string;
  createdAt: string;
  type: TransactionType;
  currency: WalletCurrency;
  amount: number;
  status: TransactionStatus;
  description: string;
  balanceAfter: number | null;
};

const DEFAULT_BALANCES: WalletBalances = {
  VAC: 0,
  BTC: 0,
  ETH: 0,
};

const STORAGE_KEY_PREFIX = "vacant_wallet_v1";

type WalletState = {
  userId: string | null;
  balances: WalletBalances;
  displayCurrency: WalletCurrency;
  transactions: WalletTransaction[];
  hydrateForCurrentUser: () => void;
  setDisplayCurrency: (currency: WalletCurrency) => void;
  deposit: (currency: WalletCurrency, amount: number) => void;
  submitWithdrawRequest: (currency: WalletCurrency, amount: number) => void;
  claimFreeCoins: () => void;
};

function buildStorageKey(userId: string) {
  // 以 userId 區分儲存 key，避免不同帳號（含訪客）互相覆蓋錢包資料。
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

function getCurrentUserId() {
  return useAuthStore.getState().user?.id ?? null;
}

function createTransaction(
  partial: Omit<WalletTransaction, "id" | "createdAt">,
): WalletTransaction {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

function loadUserWallet(userId: string): {
  balances: WalletBalances;
  transactions: WalletTransaction[];
} {
  if (typeof window === "undefined") {
    return { balances: DEFAULT_BALANCES, transactions: [] };
  }

  const raw = window.localStorage.getItem(buildStorageKey(userId));
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

function persistUserWallet(
  userId: string | null,
  balances: WalletBalances,
  transactions: WalletTransaction[],
) {
  if (!userId || typeof window === "undefined") return;
  window.localStorage.setItem(
    buildStorageKey(userId),
    JSON.stringify({ balances, transactions }),
  );
}

export const useWalletStore = create<WalletState>((set, get) => ({
  userId: null,
  balances: DEFAULT_BALANCES,
  displayCurrency: "VAC",
  transactions: [],

  hydrateForCurrentUser: () => {
    const userId = getCurrentUserId();
    if (!userId) {
      set({
        userId: null,
        balances: DEFAULT_BALANCES,
        transactions: [],
      });
      return;
    }

    const { balances, transactions } = loadUserWallet(userId);
    // 身份切換（訪客/已登入）時，重新載入對應身份的錢包快照。
    set({ userId, balances, transactions });
  },

  setDisplayCurrency: (currency) => {
    set({ displayCurrency: currency });
  },

  deposit: (currency, amount) => {
    const userId = get().userId;
    if (!userId || amount <= 0) return;

    const nextBalances: WalletBalances = {
      ...get().balances,
      [currency]: get().balances[currency] + amount,
    };
    const nextTransactions = [
      createTransaction({
        type: "deposit",
        currency,
        amount,
        status: "completed",
        description: `模擬充值 ${currency}`,
        balanceAfter: nextBalances[currency],
      }),
      ...get().transactions,
    ];

    set({ balances: nextBalances, transactions: nextTransactions });
    persistUserWallet(userId, nextBalances, nextTransactions);
  },

  submitWithdrawRequest: (currency, amount) => {
    const userId = get().userId;
    if (!userId || amount <= 0) return;

    const nextTransactions = [
      createTransaction({
        type: "withdraw",
        currency,
        amount,
        // 目前規格為「提領申請」：先記 pending，不直接扣款。
        status: "pending",
        description: `模擬提領申請 ${currency}`,
        // pending 階段尚無最終餘額，因此以 null 表示。
        balanceAfter: null,
      }),
      ...get().transactions,
    ];

    set({ transactions: nextTransactions });
    persistUserWallet(userId, get().balances, nextTransactions);
  },

  claimFreeCoins: () => {
    const userId = get().userId;
    if (!userId) return;

    const amount = 1000;
    const nextBalances: WalletBalances = {
      ...get().balances,
      VAC: get().balances.VAC + amount,
    };
    const nextTransactions = [
      createTransaction({
        type: "claim",
        currency: "VAC",
        amount,
        status: "completed",
        description: "免費領取 vAcAnt Coins",
        balanceAfter: nextBalances.VAC,
      }),
      ...get().transactions,
    ];

    set({ balances: nextBalances, transactions: nextTransactions });
    persistUserWallet(userId, nextBalances, nextTransactions);
  },
}));
