"use client";

import { create } from "zustand";
import {
  CLAIM_AMOUNT,
  CLAIM_COOLDOWN_MS,
  CLAIM_DAILY_LIMIT,
  DEFAULT_BALANCES,
  DEPOSIT_DAILY_LIMIT,
  DEPOSIT_PER_MINUTE_LIMIT,
  DEPOSIT_SINGLE_LIMIT,
} from "./wallet/constants";
import {
  getDbClaimStats,
  getDbDepositStats,
  getDbUserByAuthUserId,
  getOrCreateWallet,
  insertTransaction,
  listTransactions,
  adjustWalletBalance,
} from "./wallet/dbWallet";
import { applyGamePayout, placeGameWager } from "./wallet/gameTransactions";
import {
  buildStorageKey,
  createTransaction,
  getCurrentGuestId,
  getCurrentUser,
  getLocalClaimStats,
  getLocalDepositStats,
  loadLocalWallet,
  persistLocalWallet,
} from "./wallet/localWallet";
import { toNumber } from "./wallet/numberUtils";
import type {
  WalletBalances,
  WalletPendingAction,
  WalletSet,
  WalletState,
} from "./wallet/types";

/** 開始一個動作：標記 pending、清空該動作上一次的錯誤訊息。 */
function beginAction(set: WalletSet, action: WalletPendingAction) {
  set((state) => ({
    pending: { ...state.pending, [action]: true },
    errors: { ...state.errors, [action]: null },
  }));
}

/** 動作結束：解除 pending 鎖，並寫入這次的結果（null 代表成功，字串代表要顯示給使用者的錯誤訊息）。 */
function endAction(
  set: WalletSet,
  action: WalletPendingAction,
  message: string | null,
) {
  set((state) => ({
    pending: { ...state.pending, [action]: false },
    errors: { ...state.errors, [action]: message },
  }));
}

export type {
  WalletCurrency,
  TransactionType,
  TransactionStatus,
  WalletBalances,
  WalletTransaction,
  WalletPendingAction,
} from "./wallet/types";

/**
 * 跨分頁同步：`storage` 事件只會在「其他」分頁觸發，用來偵測「另一個分頁的訪客錢包本地資料變了」
 * （例如分頁 A 領取免費幣，分頁 B 的餘額卡片要跟著更新），重新 hydrate 補上差異。
 * 登入使用者的錢包資料在 Supabase（非 localStorage），跨分頁新鮮度改由 CrossTabSyncProvider 的
 * visibility/focus 重新 hydrate 處理。
 */
export function attachWalletStorageSync(): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: StorageEvent) => {
    if (!event.key) return;
    const guestId = getCurrentGuestId();
    if (guestId && event.key === buildStorageKey(guestId)) {
      void useWalletStore.getState().hydrateForCurrentUser();
    }
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export const useWalletStore = create<WalletState>((set, get) => ({
  userId: null,
  balances: DEFAULT_BALANCES,
  displayCurrency: "VAC",
  transactions: [],
  pending: { deposit: false, withdraw: false, claim: false },
  errors: { deposit: null, withdraw: null, claim: null },

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
    const user = getCurrentUser();
    if (!user) return;
    // 執行中鎖：仿結帳流程的 confirmLockRef，避免連點在上一筆充值完成前就送出下一筆。
    if (get().pending.deposit) return;
    beginAction(set, "deposit");

    if (amount <= 0 || amount > DEPOSIT_SINGLE_LIMIT) {
      endAction(
        set,
        "deposit",
        `請輸入有效充值金額（單筆上限 ${DEPOSIT_SINGLE_LIMIT.toLocaleString()} VAC）`,
      );
      return;
    }

    try {
      if (user.is_guest) {
        const guestId = getCurrentGuestId();
        if (!guestId) {
          endAction(set, "deposit", "帳號狀態異常，請重新登入後再試");
          return;
        }
        const localStats = getLocalDepositStats(get().transactions);
        if (localStats.minuteCount >= DEPOSIT_PER_MINUTE_LIMIT) {
          endAction(set, "deposit", "充值過於頻繁，請稍後再試");
          return;
        }
        if (localStats.todayAmount + amount > DEPOSIT_DAILY_LIMIT) {
          endAction(set, "deposit", "已達今日充值上限");
          return;
        }

        set((state) => {
          const nextBalances: WalletBalances = {
            ...state.balances,
            [currency]: state.balances[currency] + amount,
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
            ...state.transactions,
          ];
          persistLocalWallet(guestId, nextBalances, nextTransactions);
          return { balances: nextBalances, transactions: nextTransactions };
        });
        endAction(set, "deposit", null);
        return;
      }

      // VAC-first：登入後只將 VAC 寫入真實錢包。
      if (currency !== "VAC") {
        endAction(set, "deposit", null);
        return;
      }

      const dbUser = await getDbUserByAuthUserId(user.id);
      const dbStats = await getDbDepositStats(dbUser.id);
      if (dbStats.minuteCount >= DEPOSIT_PER_MINUTE_LIMIT) {
        endAction(set, "deposit", "充值過於頻繁，請稍後再試");
        return;
      }
      if (dbStats.todayAmount + amount > DEPOSIT_DAILY_LIMIT) {
        endAction(set, "deposit", "已達今日充值上限");
        return;
      }

      const result = await adjustWalletBalance({
        delta: amount,
        type: "deposit",
        description: "充值 vAcAnt Coins",
      });
      if (!result.ok) throw new Error(result.error);
      await get().hydrateForCurrentUser();
      endAction(set, "deposit", null);
    } catch (e) {
      console.warn("deposit failed:", e);
      endAction(set, "deposit", "充值失敗，請稍後再試");
    }
  },

  submitWithdrawRequest: async (currency, amount) => {
    const user = getCurrentUser();
    if (!user) return;
    if (get().pending.withdraw) return;
    beginAction(set, "withdraw");

    if (amount <= 0) {
      endAction(set, "withdraw", "請輸入有效提領金額");
      return;
    }

    try {
      if (user.is_guest) {
        const guestId = getCurrentGuestId();
        if (!guestId) {
          endAction(set, "withdraw", "帳號狀態異常，請重新登入後再試");
          return;
        }

        set((state) => {
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
            ...state.transactions,
          ];
          persistLocalWallet(guestId, state.balances, nextTransactions);
          return { transactions: nextTransactions };
        });
        endAction(set, "withdraw", null);
        return;
      }

      if (currency !== "VAC") {
        endAction(set, "withdraw", null);
        return;
      }

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
      endAction(set, "withdraw", null);
    } catch (e) {
      console.warn("withdraw request failed:", e);
      endAction(set, "withdraw", "提領申請失敗，請稍後再試");
    }
  },

  claimFreeCoins: async () => {
    const user = getCurrentUser();
    if (!user) return;
    if (get().pending.claim) return;
    beginAction(set, "claim");

    const amount = CLAIM_AMOUNT;
    try {
      if (user.is_guest) {
        const guestId = getCurrentGuestId();
        if (!guestId) {
          endAction(set, "claim", "帳號狀態異常，請重新登入後再試");
          return;
        }
        const localStats = getLocalClaimStats(get().transactions);
        if (localStats.todayCount >= CLAIM_DAILY_LIMIT) {
          endAction(set, "claim", "今日領取次數已達上限");
          return;
        }
        if (
          localStats.lastClaimAtMs !== null &&
          Date.now() - localStats.lastClaimAtMs < CLAIM_COOLDOWN_MS
        ) {
          endAction(set, "claim", "領取過於頻繁，請稍後再試");
          return;
        }

        set((state) => {
          const nextBalances: WalletBalances = {
            ...state.balances,
            VAC: state.balances.VAC + amount,
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
            ...state.transactions,
          ];
          persistLocalWallet(guestId, nextBalances, nextTransactions);
          return { balances: nextBalances, transactions: nextTransactions };
        });
        endAction(set, "claim", null);
        return;
      }

      const dbUser = await getDbUserByAuthUserId(user.id);
      const claimStats = await getDbClaimStats(dbUser.id);
      if (claimStats.todayCount >= CLAIM_DAILY_LIMIT) {
        endAction(set, "claim", "今日領取次數已達上限");
        return;
      }
      if (
        claimStats.lastClaimAtMs !== null &&
        Date.now() - claimStats.lastClaimAtMs < CLAIM_COOLDOWN_MS
      ) {
        endAction(set, "claim", "領取過於頻繁，請稍後再試");
        return;
      }

      const result = await adjustWalletBalance({
        delta: amount,
        type: "claim",
        description: "免費領取 vAcAnt Coins",
      });
      if (!result.ok) throw new Error(result.error);
      await get().hydrateForCurrentUser();
      endAction(set, "claim", null);
    } catch (e) {
      console.warn("claim free coins failed:", e);
      endAction(set, "claim", "領取失敗，請稍後再試");
    }
  },

  placeSlotWager: (params) => placeGameWager(set, get, "slots", params),
  applySlotPayout: (params) => applyGamePayout(set, get, "slots", params),
  placeBlackjackWager: (params) =>
    placeGameWager(set, get, "blackjack", params),
  applyBlackjackPayout: (params) =>
    applyGamePayout(set, get, "blackjack", params),
  placeBaccaratWager: (params) =>
    placeGameWager(set, get, "baccarat", params),
  applyBaccaratPayout: (params) =>
    applyGamePayout(set, get, "baccarat", params),
}));
