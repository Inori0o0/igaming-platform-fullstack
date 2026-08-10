"use client";

import type { WalletTransaction } from "@/src/store/walletStore";
import {
  transactionTypeFilterOptions,
  WALLET_TRANSACTION_TYPES,
} from "@shared/labels/transaction";
import { useT } from "@/src/i18n/I18nProvider";

type TransactionFiltersProps = {
  txTypeFilter: "all" | WalletTransaction["type"];
  onTypeFilterChange: (next: "all" | WalletTransaction["type"]) => void;
};

export function TransactionFilters({
  txTypeFilter,
  onTypeFilterChange,
}: TransactionFiltersProps) {
  const t = useT();
  const options = transactionTypeFilterOptions(t, WALLET_TRANSACTION_TYPES).map(
    (opt) =>
      opt.value === ""
        ? { value: "all" as const, label: opt.label }
        : {
            value: opt.value as WalletTransaction["type"],
            label: opt.label,
          },
  );

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={txTypeFilter}
        onChange={(e) =>
          onTypeFilterChange(e.target.value as "all" | WalletTransaction["type"])
        }
        className="rounded-lg border border-cyan-500/30 bg-neutral-950/80 px-2 py-1 text-xs text-neutral-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
