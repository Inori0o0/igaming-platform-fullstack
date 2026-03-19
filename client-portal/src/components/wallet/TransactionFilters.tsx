"use client";

import type { WalletCurrency, WalletTransaction } from "@/src/store/walletStore";
import { currencyLabels } from "@/src/components/wallet/constants";

type TransactionFiltersProps = {
  txTypeFilter: "all" | WalletTransaction["type"];
  txCurrencyFilter: "all" | WalletCurrency;
  onTypeFilterChange: (next: "all" | WalletTransaction["type"]) => void;
  onCurrencyFilterChange: (next: "all" | WalletCurrency) => void;
};

export function TransactionFilters({
  txTypeFilter,
  txCurrencyFilter,
  onTypeFilterChange,
  onCurrencyFilterChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={txTypeFilter}
        onChange={(e) =>
          onTypeFilterChange(e.target.value as "all" | WalletTransaction["type"])
        }
        className="rounded-lg border border-cyan-500/30 bg-neutral-950/80 px-2 py-1 text-xs text-neutral-100"
      >
        <option value="all">全部類型</option>
        <option value="deposit">充值</option>
        <option value="withdraw">提領</option>
        <option value="claim">免費領取</option>
      </select>

      <select
        value={txCurrencyFilter}
        onChange={(e) =>
          onCurrencyFilterChange(e.target.value as "all" | WalletCurrency)
        }
        className="rounded-lg border border-cyan-500/30 bg-neutral-950/80 px-2 py-1 text-xs text-neutral-100"
      >
        <option value="all">全部幣別</option>
        {(Object.keys(currencyLabels) as WalletCurrency[]).map((currency) => (
          <option key={currency} value={currency}>
            {currencyLabels[currency]}
          </option>
        ))}
      </select>
    </div>
  );
}

