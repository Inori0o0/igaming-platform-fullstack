"use client";

import { create } from "zustand";
import { useAuthStore } from "@/src/store/authStore";
import { supabase } from "@/src/lib/supabaseClient";

export type WalletCurrency = "VAC" | "BTC" | "ETH";
export type TransactionType =
  | "deposit"
  | "withdraw"
  | "claim"
  | "wager"
  | "payout";
export type TransactionStatus = "completed" | "pending" | "failed";

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
const CLAIM_AMOUNT = 6767;
const CLAIM_COOLDOWN_MS = 1500;
const CLAIM_DAILY_LIMIT = 677;
const DEPOSIT_SINGLE_LIMIT = 200000;
const DEPOSIT_PER_MINUTE_LIMIT = 10;
const DEPOSIT_DAILY_LIMIT = 5000000;

type WalletState = {
  userId: string | null;
  balances: WalletBalances;
  displayCurrency: WalletCurrency;
  transactions: WalletTransaction[];
  hydrateForCurrentUser: () => Promise<void>;
  setDisplayCurrency: (currency: WalletCurrency) => void;
  deposit: (currency: WalletCurrency, amount: number) => Promise<void>;
  submitWithdrawRequest: (
    currency: WalletCurrency,
    amount: number,
  ) => Promise<void>;
  claimFreeCoins: () => Promise<void>;
  placeSlotWager: (params: {
    themeId: string;
    totalBet: number;
    roundId: string;
  }) => Promise<boolean>;
  applySlotPayout: (params: {
    themeId: string;
    payout: number;
    totalBet: number;
    roundId: string;
  }) => Promise<void>;
};

type DbUserRow = {
  id: string;
  auth_user_id: string | null;
};

type DbWalletRow = {
  user_id: string;
  coin_balance: number | string | null;
  btc_balance: number | string | null;
  eth_balance: number | string | null;
};

type DbTransactionRow = {
  id: string;
  type: TransactionType;
  currency: WalletCurrency;
  amount: number | string;
  description: string | null;
  created_at: string;
  status: string | null;
  balance_after: number | string | null;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getStartOfDayIso() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function getThresholdIso(ms: number) {
  return new Date(Date.now() - ms).toISOString();
}

function buildStorageKey(identityId: string) {
  // 以 userId 區分儲存 key，避免不同帳號（含訪客）互相覆蓋錢包資料。
  return `${STORAGE_KEY_PREFIX}:${identityId}`;
}

function getCurrentUser() {
  return useAuthStore.getState().user ?? null;
}

function getCurrentGuestId() {
  const user = getCurrentUser();
  if (!user || !user.is_guest) return null;
  return user.id;
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

function loadLocalWallet(identityId: string): {
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

function persistLocalWallet(
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

async function getDbUserByAuthUserId(authUserId: string): Promise<DbUserRow> {
  const { data, error } = await supabase
    .from("users")
    .select("id, auth_user_id")
    .eq("auth_user_id", authUserId)
    .single();

  if (error || !data) {
    throw new Error("找不到對應的資料庫使用者，請確認 SQL trigger 已生效。");
  }

  return data as DbUserRow;
}

async function getOrCreateWallet(dbUserId: string): Promise<DbWalletRow> {
  const { data, error } = await supabase
    .from("wallets")
    .select("user_id, coin_balance, btc_balance, eth_balance")
    .eq("user_id", dbUserId)
    .maybeSingle();

  if (error) {
    throw new Error("讀取錢包失敗");
  }

  if (data) {
    return data as DbWalletRow;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("wallets")
    .insert({
      user_id: dbUserId,
      coin_balance: 0,
      btc_balance: 0,
      eth_balance: 0,
    })
    .select("user_id, coin_balance, btc_balance, eth_balance")
    .single();

  if (insertError || !inserted) {
    throw new Error("建立錢包失敗");
  }

  return inserted as DbWalletRow;
}

async function listTransactions(dbUserId: string): Promise<WalletTransaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, type, currency, amount, description, created_at, status, balance_after",
    )
    .eq("user_id", dbUserId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    throw new Error("讀取交易紀錄失敗");
  }

  return (data as DbTransactionRow[]).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    type: row.type,
    currency: row.currency,
    amount: toNumber(row.amount),
    status:
      row.status === "pending" || row.status === "failed"
        ? row.status
        : "completed",
    description: row.description ?? "",
    balanceAfter:
      row.balance_after === null ? null : toNumber(row.balance_after),
  }));
}

async function insertTransaction(params: {
  dbUserId: string;
  type: TransactionType;
  amount: number;
  status: "pending" | "completed" | "failed";
  description: string;
  balanceAfter: number | null;
  gameId?: string;
  themeId?: string;
  roundId?: string;
  metadata?: Record<string, unknown>;
}) {
  // phase-5: 遊戲交易可附帶 round/game/theme，舊交易流程（deposit/claim/withdraw）不受影響。
  const payload: Record<string, unknown> = {
    user_id: params.dbUserId,
    type: params.type,
    currency: "VAC",
    amount: params.amount,
    status: params.status,
    description: params.description,
    balance_after: params.balanceAfter,
  };
  if (params.gameId) payload.game_id = params.gameId;
  if (params.themeId) payload.theme_id = params.themeId;
  if (params.roundId) payload.round_id = params.roundId;
  if (params.metadata) payload.metadata = params.metadata;
  const { error } = await supabase.from("transactions").insert(payload);

  if (error) {
    throw new Error("寫入交易紀錄失敗");
  }
}

async function getDbClaimStats(dbUserId: string) {
  const { count, error: countError } = await supabase
    .from("transactions")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", dbUserId)
    .eq("type", "claim")
    .gte("created_at", getStartOfDayIso());
  if (countError) {
    throw new Error("讀取 claim 統計失敗");
  }

  const { data: latestRow, error: latestError } = await supabase
    .from("transactions")
    .select("created_at")
    .eq("user_id", dbUserId)
    .eq("type", "claim")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) {
    throw new Error("讀取 claim 最新時間失敗");
  }

  return {
    todayCount: count ?? 0,
    lastClaimAtMs: latestRow?.created_at
      ? new Date(latestRow.created_at).getTime()
      : null,
  };
}

async function getDbDepositStats(dbUserId: string) {
  const { count, error: minuteCountError } = await supabase
    .from("transactions")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", dbUserId)
    .eq("type", "deposit")
    .gte("created_at", getThresholdIso(60_000));
  if (minuteCountError) {
    throw new Error("讀取 deposit 每分鐘統計失敗");
  }

  const { data: todayRows, error: todayError } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", dbUserId)
    .eq("type", "deposit")
    .gte("created_at", getStartOfDayIso());
  if (todayError) {
    throw new Error("讀取 deposit 每日統計失敗");
  }

  const todayAmount = (todayRows ?? []).reduce(
    (sum, row) => sum + toNumber(row.amount),
    0,
  );

  return {
    minuteCount: count ?? 0,
    todayAmount,
  };
}

function getLocalClaimStats(transactions: WalletTransaction[]) {
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

function getLocalDepositStats(transactions: WalletTransaction[]) {
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

async function updateCoinBalance(dbUserId: string, nextBalance: number) {
  const { error } = await supabase
    .from("wallets")
    .update({ coin_balance: nextBalance })
    .eq("user_id", dbUserId);
  if (error) {
    throw new Error("更新錢包餘額失敗");
  }
}

export const useWalletStore = create<WalletState>((set, get) => ({
  userId: null,
  balances: DEFAULT_BALANCES,
  displayCurrency: "VAC",
  transactions: [],

  hydrateForCurrentUser: async () => {
    const user = getCurrentUser();
    if (!user) {
      set({
        userId: null,
        balances: DEFAULT_BALANCES,
        transactions: [],
      });
      return;
    }

    // 訪客模式：僅保留瀏覽器本地資料，不落庫。
    if (user.is_guest) {
      const guestId = getCurrentGuestId();
      if (!guestId) return;
      const { balances, transactions } = loadLocalWallet(guestId);
      set({ userId: guestId, balances, transactions });
      return;
    }

    try {
      const dbUser = await getDbUserByAuthUserId(user.id);
      const wallet = await getOrCreateWallet(dbUser.id);
      const transactions = await listTransactions(dbUser.id);
      set({
        userId: user.id,
        balances: {
          VAC: toNumber(wallet.coin_balance),
          BTC: toNumber(wallet.btc_balance),
          ETH: toNumber(wallet.eth_balance),
        },
        transactions,
      });
    } catch (e) {
      console.warn("hydrate wallet from supabase failed:", e);
      set({
        userId: user.id,
        balances: DEFAULT_BALANCES,
        transactions: [],
      });
    }
  },

  setDisplayCurrency: (currency) => {
    set({ displayCurrency: currency });
  },

  deposit: async (currency, amount) => {
    if (amount <= 0 || amount > DEPOSIT_SINGLE_LIMIT) return;
    const user = getCurrentUser();
    if (!user) return;

    if (user.is_guest) {
      const guestId = getCurrentGuestId();
      if (!guestId) return;
      const localStats = getLocalDepositStats(get().transactions);
      if (localStats.minuteCount >= DEPOSIT_PER_MINUTE_LIMIT) return;
      if (localStats.todayAmount + amount > DEPOSIT_DAILY_LIMIT) return;

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
      persistLocalWallet(guestId, nextBalances, nextTransactions);
      return;
    }

    // VAC-first：登入後只將 VAC 寫入真實錢包。
    if (currency !== "VAC") return;

    try {
      const dbUser = await getDbUserByAuthUserId(user.id);
      const dbStats = await getDbDepositStats(dbUser.id);
      if (dbStats.minuteCount >= DEPOSIT_PER_MINUTE_LIMIT) return;
      if (dbStats.todayAmount + amount > DEPOSIT_DAILY_LIMIT) return;

      const wallet = await getOrCreateWallet(dbUser.id);
      const nextBalance = toNumber(wallet.coin_balance) + amount;

      await updateCoinBalance(dbUser.id, nextBalance);
      await insertTransaction({
        dbUserId: dbUser.id,
        type: "deposit",
        amount,
        status: "completed",
        description: "充值 vAcAnt Coins",
        balanceAfter: nextBalance,
      });
      await get().hydrateForCurrentUser();
    } catch (e) {
      console.warn("deposit failed:", e);
    }
  },

  submitWithdrawRequest: async (currency, amount) => {
    if (amount <= 0) return;
    const user = getCurrentUser();
    if (!user) return;

    if (user.is_guest) {
      const guestId = getCurrentGuestId();
      if (!guestId) return;

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
      persistLocalWallet(guestId, get().balances, nextTransactions);
      return;
    }

    if (currency !== "VAC") return;

    try {
      const dbUser = await getDbUserByAuthUserId(user.id);
      await insertTransaction({
        dbUserId: dbUser.id,
        type: "withdraw",
        amount,
        status: "pending",
        description: "提領申請 vAcAnt Coins",
        balanceAfter: null,
      });
      await get().hydrateForCurrentUser();
    } catch (e) {
      console.warn("withdraw request failed:", e);
    }
  },

  claimFreeCoins: async () => {
    const user = getCurrentUser();
    if (!user) return;

    const amount = CLAIM_AMOUNT;
    if (user.is_guest) {
      const guestId = getCurrentGuestId();
      if (!guestId) return;
      const localStats = getLocalClaimStats(get().transactions);
      if (localStats.todayCount >= CLAIM_DAILY_LIMIT) return;
      if (
        localStats.lastClaimAtMs !== null &&
        Date.now() - localStats.lastClaimAtMs < CLAIM_COOLDOWN_MS
      ) {
        return;
      }

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
      persistLocalWallet(guestId, nextBalances, nextTransactions);
      return;
    }

    try {
      const dbUser = await getDbUserByAuthUserId(user.id);
      const claimStats = await getDbClaimStats(dbUser.id);
      if (claimStats.todayCount >= CLAIM_DAILY_LIMIT) return;
      if (
        claimStats.lastClaimAtMs !== null &&
        Date.now() - claimStats.lastClaimAtMs < CLAIM_COOLDOWN_MS
      ) {
        return;
      }

      const wallet = await getOrCreateWallet(dbUser.id);
      const nextBalance = toNumber(wallet.coin_balance) + amount;

      await updateCoinBalance(dbUser.id, nextBalance);
      await insertTransaction({
        dbUserId: dbUser.id,
        type: "claim",
        amount,
        status: "completed",
        description: "免費領取 vAcAnt Coins",
        balanceAfter: nextBalance,
      });
      await get().hydrateForCurrentUser();
    } catch (e) {
      console.warn("claim free coins failed:", e);
    }
  },

  // Slots: 扣款交易（wager）。前端先做餘額預檢，再寫入 DB/local。
  placeSlotWager: async ({ themeId, totalBet, roundId }) => {
    const user = getCurrentUser();
    if (!user || totalBet <= 0) return false;
    const amount = Math.round(totalBet);

    if (user.is_guest) {
      const guestId = getCurrentGuestId();
      if (!guestId) return false;
      const currentVac = get().balances.VAC;
      if (currentVac < amount) return false;
      const nextVac = currentVac - amount;
      const nextBalances: WalletBalances = { ...get().balances, VAC: nextVac };
      const nextTransactions = [
        createTransaction({
          type: "wager",
          currency: "VAC",
          amount,
          status: "completed",
          description: `Slots 下注（${themeId}）`,
          balanceAfter: nextVac,
        }),
        ...get().transactions,
      ];
      set({ balances: nextBalances, transactions: nextTransactions });
      persistLocalWallet(guestId, nextBalances, nextTransactions);
      return true;
    }

    try {
      const dbUser = await getDbUserByAuthUserId(user.id);
      const wallet = await getOrCreateWallet(dbUser.id);
      const currentVac = toNumber(wallet.coin_balance);
      if (currentVac < amount) return false;
      const nextBalance = currentVac - amount;

      await updateCoinBalance(dbUser.id, nextBalance);
      await insertTransaction({
        dbUserId: dbUser.id,
        type: "wager",
        amount,
        status: "completed",
        description: `Slots 下注（${themeId}）`,
        balanceAfter: nextBalance,
        gameId: "slots",
        themeId,
        roundId,
        metadata: { totalBet: amount },
      });
      await get().hydrateForCurrentUser();
      return true;
    } catch (e) {
      console.warn("place slot wager failed:", e);
      return false;
    }
  },

  // Slots: 派彩交易（payout）。金額可為 0，仍寫交易方便之後對帳 round。
  applySlotPayout: async ({
    themeId,
    payout,
    totalBet,
    roundId,
  }) => {
    const user = getCurrentUser();
    if (!user) return;
    const amount = Math.max(0, Math.round(payout));

    if (user.is_guest) {
      const guestId = getCurrentGuestId();
      if (!guestId) return;
      const nextVac = get().balances.VAC + amount;
      const nextBalances: WalletBalances = { ...get().balances, VAC: nextVac };
      const nextTransactions = [
        createTransaction({
          type: "payout",
          currency: "VAC",
          amount,
          status: "completed",
          description: `Slots 派彩（${themeId}）`,
          balanceAfter: nextVac,
        }),
        ...get().transactions,
      ];
      set({ balances: nextBalances, transactions: nextTransactions });
      persistLocalWallet(guestId, nextBalances, nextTransactions);
      return;
    }

    try {
      const dbUser = await getDbUserByAuthUserId(user.id);
      const wallet = await getOrCreateWallet(dbUser.id);
      const nextBalance = toNumber(wallet.coin_balance) + amount;
      await updateCoinBalance(dbUser.id, nextBalance);
      await insertTransaction({
        dbUserId: dbUser.id,
        type: "payout",
        amount,
        status: "completed",
        description: `Slots 派彩（${themeId}）`,
        balanceAfter: nextBalance,
        gameId: "slots",
        themeId,
        roundId,
        metadata: { totalBet: Math.round(totalBet), totalCredits: amount },
      });
      await get().hydrateForCurrentUser();
    } catch (e) {
      console.warn("apply slot payout failed:", e);
    }
  },
}));
