"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";

type DepositActionProps = {
  onDeposit: (amount: number) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function DepositAction({
  onDeposit,
  isSubmitting,
  errorMessage,
}: DepositActionProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [inputError, setInputError] = useState("");
  const MAX_DEPOSIT_PER_TX = 200000;

  const onCustomDeposit = () => {
    const amount = Number(depositAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setInputError("請輸入有效金額");
      return;
    }
    if (amount > MAX_DEPOSIT_PER_TX) {
      setInputError(`單筆上限為 ${MAX_DEPOSIT_PER_TX.toLocaleString()} VAC`);
      return;
    }
    onDeposit(amount);
    setDepositAmount("");
    setInputError("");
  };

  return (
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
            onClick={() => onDeposit(amount)}
            disabled={isSubmitting}
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
            onChange={(e) => {
              setDepositAmount(e.target.value);
              if (inputError) setInputError("");
            }}
            inputMode="decimal"
            placeholder="輸入數字"
            error={inputError || undefined}
            helperText={`單筆上限 ${MAX_DEPOSIT_PER_TX.toLocaleString()} VAC`}
            disabled={isSubmitting}
          />
        </div>
        <Button size="sm" onClick={onCustomDeposit} disabled={isSubmitting}>
          {isSubmitting ? "充值中…" : "充值"}
        </Button>
      </div>
      {errorMessage ? (
        <p className="mt-2 text-xs text-rose-400" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

