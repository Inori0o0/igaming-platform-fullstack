import type { WalletCurrency } from "@/src/store/walletStore";

const amountDecimals: Record<WalletCurrency, number> = {
  VAC: 0,
  BTC: 6,
  ETH: 6,
};

export function formatAmount(currency: WalletCurrency, amount: number) {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: amountDecimals[currency],
  });
}

export function formatTime(value: string) {
  return new Date(value).toLocaleString("zh-TW", { hour12: false });
}

