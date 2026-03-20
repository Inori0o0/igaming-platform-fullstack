"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";

type WithdrawActionProps = {
  onSubmitWithdrawRequest: (amount: number) => void;
};

export function WithdrawAction({ onSubmitWithdrawRequest }: WithdrawActionProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const onSubmitWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    onSubmitWithdrawRequest(amount);
    setWithdrawAmount("");
  };

  return (
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
  );
}

