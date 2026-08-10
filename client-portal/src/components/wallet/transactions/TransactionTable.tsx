"use client";

import type { WalletTransaction } from "@/src/store/walletStore";
import {
  transactionStatusLabel,
  transactionTypeLabel,
} from "@shared/labels/transaction";
import { formatAmount, formatTime } from "@/src/components/wallet/format";
import { useT } from "@/src/i18n/I18nProvider";

type TransactionTableProps = {
  transactions: WalletTransaction[];
};

export function TransactionTable({ transactions }: TransactionTableProps) {
  const t = useT();

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-500/20">
      <table className="w-full border-collapse text-xs">
        <thead className="bg-neutral-900/85 text-neutral-300">
          <tr>
            <th className="px-3 py-2 text-left font-medium">時間</th>
            <th className="px-3 py-2 text-left font-medium">類型</th>
            <th className="px-3 py-2 text-left font-medium">幣別</th>
            <th className="px-3 py-2 text-right font-medium">金額</th>
            <th className="px-3 py-2 text-left font-medium">狀態</th>
            <th className="px-3 py-2 text-left font-medium">備註</th>
          </tr>
        </thead>
        <tbody className="bg-neutral-950/70 text-neutral-200">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-neutral-500">
                目前沒有交易紀錄
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr key={tx.id} className="border-t border-cyan-500/10 align-top">
                <td className="px-3 py-2 text-neutral-400">{formatTime(tx.createdAt)}</td>
                <td className="px-3 py-2">{transactionTypeLabel(tx.type, t)}</td>
                <td className="px-3 py-2">{tx.currency}</td>
                <td className="px-3 py-2 text-right font-semibold text-cyan-100">
                  {formatAmount(tx.currency, tx.amount)}
                </td>
                <td className="px-3 py-2">{transactionStatusLabel(tx.status, t)}</td>
                <td className="px-3 py-2 text-neutral-400">{tx.description}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
