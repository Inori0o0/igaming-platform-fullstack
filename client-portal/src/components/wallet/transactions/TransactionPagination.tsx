"use client";

import { Button } from "@/src/components/ui/Button";
import { TRANSACTIONS_PER_PAGE } from "@/src/components/wallet/constants";

type TransactionPaginationProps = {
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function TransactionPagination({
  page,
  totalPages,
  onPrevPage,
  onNextPage,
}: TransactionPaginationProps) {
  return (
    <div className="flex items-center justify-between text-xs text-neutral-400">
      <span>
        第 {page} / {totalPages} 頁（每頁 {TRANSACTIONS_PER_PAGE} 筆）
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" disabled={page <= 1} onClick={onPrevPage}>
          上一頁
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={page >= totalPages}
          onClick={onNextPage}
        >
          下一頁
        </Button>
      </div>
    </div>
  );
}

