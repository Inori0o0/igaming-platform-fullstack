import type { WalletCurrency } from "@/src/store/walletStore";
import {
  transactionStatusLabels,
  transactionTypeLabels,
} from "@shared/labels/transaction";

export const TRANSACTIONS_PER_PAGE = 10;

export const currencyLabels: Record<WalletCurrency, string> = {
  VAC: "vAcAnt Coins",
  BTC: "BTC",
  ETH: "ETH",
};

/** Default zh-TW labels; table/filter components that are client-side should prefer `useT()`. */
export const typeLabels = transactionTypeLabels("zh-TW");
export const statusLabels = transactionStatusLabels("zh-TW");
