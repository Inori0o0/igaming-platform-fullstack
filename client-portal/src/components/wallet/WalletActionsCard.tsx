"use client";

import { Card } from "@/src/components/ui/Card";
import type { WalletCurrency } from "@/src/store/walletStore";
import { DepositAction } from "@/src/components/wallet/actions/DepositAction";
import { WithdrawAction } from "@/src/components/wallet/actions/WithdrawAction";
import { ClaimAction } from "@/src/components/wallet/actions/ClaimAction";

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
  return (
    <Card title="充值 / 提領" description="充值會立即入帳；提領為待處理申請。">
      <div className="grid gap-4 text-xs text-neutral-300">
        <DepositAction onDeposit={(amount) => onDeposit("VAC", amount)} />
        <WithdrawAction
          onSubmitWithdrawRequest={(amount) =>
            onSubmitWithdrawRequest("VAC", amount)
          }
        />
        <ClaimAction onClaimFreeCoins={onClaimFreeCoins} />
      </div>
    </Card>
  );
}

