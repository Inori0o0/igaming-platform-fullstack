"use client";

import type { WalletTransaction } from "@/src/store/walletStore";

type TransactionFiltersProps = {
  txTypeFilter: "all" | WalletTransaction["type"];
  onTypeFilterChange: (next: "all" | WalletTransaction["type"]) => void;
};

export function TransactionFilters({
  txTypeFilter,
  onTypeFilterChange,
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
        <option value="wager">下注</option>
        <option value="payout">派彩</option>
      </select>
    </div>
  );
}

