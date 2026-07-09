import { adjustWalletBalance } from "./dbWallet";
import { createTransaction, getCurrentGuestId, getCurrentUser, persistLocalWallet } from "./localWallet";
import type {
  GamePayoutParams,
  GameWagerParams,
  WalletBalances,
  WalletGet,
  WalletSet,
} from "./types";

export type GameId = "slots" | "blackjack" | "baccarat";

type GameConfig = {
  id: GameId;
  label: string;
  /** 派彩交易寫入 metadata 時使用的欄位名稱；三個遊戲的既有交易紀錄格式不完全一致，保留原樣避免影響既有對帳資料。 */
  payoutMetadataKey: "totalCredits" | "totalPayout";
};

const GAME_CONFIGS: Record<GameId, GameConfig> = {
  slots: { id: "slots", label: "Slots", payoutMetadataKey: "totalCredits" },
  blackjack: {
    id: "blackjack",
    label: "Blackjack",
    payoutMetadataKey: "totalPayout",
  },
  baccarat: {
    id: "baccarat",
    label: "Baccarat",
    payoutMetadataKey: "totalPayout",
  },
};

/**
 * 各遊戲的下注（wager）扣款邏輯共用同一套流程：訪客走本地餘額檢查與扣款，
 * 登入使用者則交由 `adjust_wallet_balance` RPC 以資料庫端原子檢查餘額。
 */
export async function placeGameWager(
  set: WalletSet,
  get: WalletGet,
  game: GameId,
  { themeId, totalBet, roundId, metadata }: GameWagerParams,
): Promise<boolean> {
  const config = GAME_CONFIGS[game];
  const user = getCurrentUser();
  if (!user || totalBet <= 0) return false;
  const amount = Math.round(totalBet);

  if (user.is_guest) {
    const guestId = getCurrentGuestId();
    if (!guestId) return false;
    let ok = false;
    set((state) => {
      const currentVac = state.balances.VAC;
      if (currentVac < amount) return state;
      ok = true;
      const nextVac = currentVac - amount;
      const nextBalances: WalletBalances = { ...state.balances, VAC: nextVac };
      const nextTransactions = [
        createTransaction({
          type: "wager",
          currency: "VAC",
          amount,
          status: "completed",
          description: `${config.label} 下注（${themeId}）`,
          balanceAfter: nextVac,
        }),
        ...state.transactions,
      ];
      persistLocalWallet(guestId, nextBalances, nextTransactions);
      return { balances: nextBalances, transactions: nextTransactions };
    });
    return ok;
  }

  const result = await adjustWalletBalance({
    delta: -amount,
    type: "wager",
    description: `${config.label} 下注（${themeId}）`,
    gameId: config.id,
    themeId,
    roundId,
    metadata: { totalBet: amount, ...metadata },
  });
  if (!result.ok) {
    console.warn(`place ${config.id} wager failed:`, result.error);
    return false;
  }
  await get().hydrateForCurrentUser();
  return true;
}

/**
 * 各遊戲的派彩（payout）邏輯共用同一套流程；金額可為 0，仍寫交易方便之後對帳 round。
 */
export async function applyGamePayout(
  set: WalletSet,
  get: WalletGet,
  game: GameId,
  { themeId, payout, totalBet, roundId, metadata }: GamePayoutParams,
): Promise<void> {
  const config = GAME_CONFIGS[game];
  const user = getCurrentUser();
  if (!user) return;
  const amount = Math.max(0, Math.round(payout));

  if (user.is_guest) {
    const guestId = getCurrentGuestId();
    if (!guestId) return;
    set((state) => {
      const nextVac = state.balances.VAC + amount;
      const nextBalances: WalletBalances = { ...state.balances, VAC: nextVac };
      const nextTransactions = [
        createTransaction({
          type: "payout",
          currency: "VAC",
          amount,
          status: "completed",
          description: `${config.label} 派彩（${themeId}）`,
          balanceAfter: nextVac,
        }),
        ...state.transactions,
      ];
      persistLocalWallet(guestId, nextBalances, nextTransactions);
      return { balances: nextBalances, transactions: nextTransactions };
    });
    return;
  }

  const result = await adjustWalletBalance({
    delta: amount,
    type: "payout",
    description: `${config.label} 派彩（${themeId}）`,
    gameId: config.id,
    themeId,
    roundId,
    metadata: {
      totalBet: Math.round(totalBet),
      [config.payoutMetadataKey]: amount,
      ...metadata,
    },
  });
  if (!result.ok) {
    console.warn(`apply ${config.id} payout failed:`, result.error);
    return;
  }
  await get().hydrateForCurrentUser();
}
