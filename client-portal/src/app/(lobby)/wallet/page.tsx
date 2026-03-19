"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { useWalletStore } from "@/src/store/walletStore";
import { BalanceCards } from "@/src/components/wallet/BalanceCards";
import { UsdtRates } from "@/src/components/wallet/UsdtRates";
import { WalletActionsCard } from "@/src/components/wallet/WalletActionsCard";
import { TransactionsCard } from "@/src/components/wallet/TransactionsCard";
import { useUsdtRates } from "@/src/components/wallet/useUsdtRates";

export default function WalletPage() {
  const userId = useAuthStore((s) => s.user?.id);
  const balances = useWalletStore((s) => s.balances);
  const transactions = useWalletStore((s) => s.transactions);
  const hydrateForCurrentUser = useWalletStore((s) => s.hydrateForCurrentUser);
  const deposit = useWalletStore((s) => s.deposit);
  const submitWithdrawRequest = useWalletStore((s) => s.submitWithdrawRequest);
  const claimFreeCoins = useWalletStore((s) => s.claimFreeCoins);
  const { rates, isLoading: isRatesLoading, error: ratesError } = useUsdtRates();

  useEffect(() => {
    // 使用者身份變化時，切換到對應的本地錢包快照。
    hydrateForCurrentUser();
  }, [hydrateForCurrentUser, userId]);

  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Wallet
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          錢包
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          目前只使用 vAcAnt Coins，並提供 VAC 與 BTC/ETH 的即時換算參考。
        </p>
      </div>

      <UsdtRates
        rates={rates}
        isRatesLoading={isRatesLoading}
        ratesError={ratesError}
      />

      <BalanceCards balances={balances} rates={rates} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <WalletActionsCard
          onDeposit={deposit}
          onSubmitWithdrawRequest={submitWithdrawRequest}
          onClaimFreeCoins={claimFreeCoins}
        />
        <TransactionsCard transactions={transactions} />
      </div>
    </main>
  );
}
