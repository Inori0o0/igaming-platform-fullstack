"use client";

import { useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import type { WalletCurrency } from "@/src/store/walletStore";

type WalletActionsCardProps = {
  onDeposit: (currency: WalletCurrency, amount: number) => void;
  onSubmitWithdrawRequest: (currency: WalletCurrency, amount: number) => void;
  onClaimFreeCoins: () => void;
};

export function WalletActionsCard({
  onDeposit,
  onSubmitWithdrawRequest,
  onClaimFreeCoins,
}: WalletActionsCardProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const onQuickDeposit = (amount: number) => {
    onDeposit("VAC", amount);
  };

  const onCustomDeposit = () => {
    const amount = Number(depositAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    onDeposit("VAC", amount);
    setDepositAmount("");
  };

  const onSubmitWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    onSubmitWithdrawRequest("VAC", amount);
    setWithdrawAmount("");
  };

  return (
    <Card title="充值 / 提領" description="充值會立即入帳；提領為待處理申請。">
      <div className="grid gap-4 text-xs text-neutral-300">
        <div className="rounded-2xl border border-cyan-500/20 bg-neutral-950/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            模擬充值（vAcAnt Coins）
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[1000, 5000, 10000].map((amount) => (
              <Button
                key={amount}
                size="sm"
                variant="secondary"
                onClick={() => onQuickDeposit(amount)}
              >
                +{amount.toLocaleString()}
              </Button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div className="min-w-44 flex-1">
              <Input
                label="自訂充值金額"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                inputMode="decimal"
                placeholder="輸入數字"
              />
            </div>
            <Button size="sm" onClick={onCustomDeposit}>
              充值
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-neutral-950/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            模擬提領（vAcAnt Coins）
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div className="min-w-44 flex-1">
              <Input
                label="提領申請金額"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                inputMode="decimal"
                placeholder="輸入數字"
                helperText="送出後會新增一筆 pending 紀錄，餘額不扣除。"
              />
            </div>
            <Button size="sm" variant="outline" onClick={onSubmitWithdraw}>
              送出提領
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
            免費領取
          </p>
          <p className="mt-1 text-xs text-neutral-300">
            每次領取 1,000 vAcAnt Coins，並寫入交易紀錄。
          </p>
          <Button className="mt-3" size="sm" onClick={onClaimFreeCoins}>
            領取 1,000 Coins
          </Button>
        </div>
      </div>
    </Card>
  );
}

