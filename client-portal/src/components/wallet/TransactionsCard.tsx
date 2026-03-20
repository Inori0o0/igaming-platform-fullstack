"use client";

import { useMemo, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import type { WalletTransaction } from "@/src/store/walletStore";
import { TRANSACTIONS_PER_PAGE } from "@/src/components/wallet/constants";
import { TransactionFilters } from "@/src/components/wallet/TransactionFilters";
import { TransactionTable } from "@/src/components/wallet/TransactionTable";
import { TransactionPagination } from "@/src/components/wallet/TransactionPagination";

type TransactionsCardProps = {
  transactions: WalletTransaction[];
};

export function TransactionsCard({ transactions }: TransactionsCardProps) {
  // 這層只管理篩選與分頁狀態；實際 UI 由子元件負責渲染。
  const [txTypeFilter, setTxTypeFilter] = useState<
    "all" | WalletTransaction["type"]
  >("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      return txTypeFilter === "all" || tx.type === txTypeFilter;
    });
  }, [transactions, txTypeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE),
  );
  const page = Math.min(currentPage, totalPages);
  const pagedTransactions = filteredTransactions.slice(
    (page - 1) * TRANSACTIONS_PER_PAGE,
    page * TRANSACTIONS_PER_PAGE,
  );

  return (
    <Card title="交易紀錄" description="支援類型/幣別篩選與前端分頁。">
      <div className="space-y-3">
        <TransactionFilters
          txTypeFilter={txTypeFilter}
          onTypeFilterChange={(next) => {
            setTxTypeFilter(next);
            setCurrentPage(1);
          }}
        />

        <TransactionTable transactions={pagedTransactions} />

        <TransactionPagination
          page={page}
          totalPages={totalPages}
          onPrevPage={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          onNextPage={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
        />
      </div>
    </Card>
  );
}
