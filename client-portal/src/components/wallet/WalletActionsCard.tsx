"use client";

import { Card } from "@/src/components/ui/Card";
import type { WalletCurrency, WalletPendingAction } from "@/src/store/walletStore";
import { DepositAction } from "@/src/components/wallet/actions/DepositAction";
import { WithdrawAction } from "@/src/components/wallet/actions/WithdrawAction";
import { ClaimAction } from "@/src/components/wallet/actions/ClaimAction";

type WalletActionsCardProps = {
  onDeposit: (currency: WalletCurrency, amount: number) => void;
  onSubmitWithdrawRequest: (currency: WalletCurrency, amount: number) => void;
  onClaimFreeCoins: () => void;
  pending: Record<WalletPendingAction, boolean>;
  errors: Record<WalletPendingAction, string | null>;
};

export function WalletActionsCard({
  onDeposit,
  onSubmitWithdrawRequest,
  onClaimFreeCoins,
  pending,
  errors,
}: WalletActionsCardProps) {
  return (
    <Card title="充值 / 提領" description="充值會立即入帳；提領為待處理申請。">
      <div className="grid gap-4 text-xs text-neutral-300">
        <DepositAction
          onDeposit={(amount) => onDeposit("VAC", amount)}
          isSubmitting={pending.deposit}
          errorMessage={errors.deposit}
        />
        <WithdrawAction
          onSubmitWithdrawRequest={(amount) =>
            onSubmitWithdrawRequest("VAC", amount)
          }
          isSubmitting={pending.withdraw}
          errorMessage={errors.withdraw}
        />
        <ClaimAction
          onClaimFreeCoins={onClaimFreeCoins}
          isSubmitting={pending.claim}
          errorMessage={errors.claim}
        />
      </div>
    </Card>
  );
}

