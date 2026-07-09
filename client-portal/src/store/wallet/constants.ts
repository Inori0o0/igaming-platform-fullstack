import type { WalletBalances } from "./types";

export const DEFAULT_BALANCES: WalletBalances = {
  VAC: 0,
  BTC: 0,
  ETH: 0,
};

export const STORAGE_KEY_PREFIX = "vacant_wallet_v1";
export const CLAIM_AMOUNT = 6767;
export const CLAIM_COOLDOWN_MS = 1500;
export const CLAIM_DAILY_LIMIT = 677;
export const DEPOSIT_SINGLE_LIMIT = 200000;
export const DEPOSIT_PER_MINUTE_LIMIT = 10;
export const DEPOSIT_DAILY_LIMIT = 5000000;
