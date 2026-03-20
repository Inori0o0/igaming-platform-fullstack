import type { WalletCurrency, WalletTransaction } from "@/src/store/walletStore";

export const TRANSACTIONS_PER_PAGE = 10;

export const currencyLabels: Record<WalletCurrency, string> = {
  VAC: "vAcAnt Coins",
  BTC: "BTC",
  ETH: "ETH",
};

export const typeLabels: Record<WalletTransaction["type"], string> = {
  deposit: "充值",
  withdraw: "提領",
  claim: "免費領取",
};

export const statusLabels: Record<WalletTransaction["status"], string> = {
  completed: "完成",
  pending: "待處理",
  failed: "失敗",
};

