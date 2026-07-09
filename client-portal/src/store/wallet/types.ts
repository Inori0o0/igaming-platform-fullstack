export type WalletCurrency = "VAC" | "BTC" | "ETH";
export type TransactionType =
  | "deposit"
  | "withdraw"
  | "claim"
  | "wager"
  | "payout"
  | "purchase";
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

export type WalletPendingAction = "deposit" | "withdraw" | "claim";

/**
 * hydrate（讀取錢包餘額）本身的狀態，跟 `errors`／`pending` 分開追蹤：
 * 那兩者是「動作」（存款/提款/領取）失敗才會有訊息，hydrate 失敗不屬於任何一個動作，
 * 之前唯一的處理是 console.warn 後把 balances 蓋成 0——玩家看到的「餘額不見了」其實只是讀取失敗。
 */
export type WalletHydrateStatus = "idle" | "loading" | "ready" | "error";

export type GameWagerParams = {
  themeId: string;
  totalBet: number;
  roundId: string;
  metadata?: Record<string, unknown>;
};

export type GamePayoutParams = {
  themeId: string;
  payout: number;
  totalBet: number;
  roundId: string;
  metadata?: Record<string, unknown>;
};

export type WalletState = {
  userId: string | null;
  balances: WalletBalances;
  displayCurrency: WalletCurrency;
  transactions: WalletTransaction[];
  /** 執行中鎖（仿結帳流程的 confirmLockRef）：同一動作在請求完成前無法被再次觸發，UI 可據此 disable 按鈕。 */
  pending: Record<WalletPendingAction, boolean>;
  /** 各錢包動作最近一次失敗訊息，取代原先僅 console.warn 的靜默失敗；成功或重新觸發時會被清空。 */
  errors: Record<WalletPendingAction, string | null>;
  /** 讀取錢包餘額本身的狀態；失敗時維持 "error" 並保留上一次成功讀到的 balances，不覆蓋成假的 0。 */
  hydrateStatus: WalletHydrateStatus;
  /** hydrate 失敗時顯示給使用者的錯誤訊息；成功時清空。 */
  hydrateError: string | null;
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
  placeBlackjackWager: (params: {
    themeId: string;
    totalBet: number;
    roundId: string;
  }) => Promise<boolean>;
  applyBlackjackPayout: (params: {
    themeId: string;
    payout: number;
    totalBet: number;
    roundId: string;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
  placeBaccaratWager: (params: {
    themeId: string;
    totalBet: number;
    roundId: string;
    metadata?: Record<string, unknown>;
  }) => Promise<boolean>;
  applyBaccaratPayout: (params: {
    themeId: string;
    payout: number;
    totalBet: number;
    roundId: string;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
};

export type DbUserRow = {
  id: string;
  auth_user_id: string | null;
};

export type DbWalletRow = {
  user_id: string;
  coin_balance: number | string | null;
  btc_balance: number | string | null;
  eth_balance: number | string | null;
};

export type DbTransactionRow = {
  id: string;
  type: TransactionType;
  currency: WalletCurrency;
  amount: number | string;
  description: string | null;
  created_at: string;
  status: string | null;
  balance_after: number | string | null;
};

export type AdjustWalletBalanceResult =
  | { ok: true; balance: number }
  | { ok: false; error: string };

/** 給 wallet store 裡的 action 使用的最小 set/get 型別，避免直接依賴 zustand 的內部型別。 */
export type WalletSet = (
  updater:
    | Partial<WalletState>
    | ((state: WalletState) => Partial<WalletState> | WalletState),
) => void;
export type WalletGet = () => WalletState;
