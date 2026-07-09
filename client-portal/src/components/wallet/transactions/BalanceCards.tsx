"use client";

import { Card } from "@/src/components/ui/Card";
import type { WalletBalances } from "@/src/store/walletStore";
import type { UsdtRates } from "@/src/types/rates";

type BalanceCardsProps = {
  balances: WalletBalances;
  rates: UsdtRates | null;
};

function toBtcFromVac(vacAmount: number, rates: UsdtRates | null) {
  if (!rates || rates.btcUsdt <= 0) return null;
  return (vacAmount * rates.vacUsdt) / rates.btcUsdt;
}

function toEthFromVac(vacAmount: number, rates: UsdtRates | null) {
  if (!rates || rates.ethUsdt <= 0) return null;
  return (vacAmount * rates.vacUsdt) / rates.ethUsdt;
}

export function BalanceCards({
  balances,
  rates,
}: BalanceCardsProps) {
  const vac = balances.VAC;
  const usdtValue = rates ? vac * rates.vacUsdt : null;
  const btcValue = toBtcFromVac(vac, rates);
  const ethValue = toEthFromVac(vac, rates);

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      <Card title="vAcAnt Coins" description="主幣別（充值與提領使用）">
        <div className="rounded-2xl bg-neutral-950/70 p-4 text-sm text-neutral-200">
          <p className="text-xs text-neutral-400">Balance</p>
          <p className="mt-2 text-2xl font-semibold text-cyan-100">
            {vac.toLocaleString()} VAC
          </p>
        </div>
      </Card>

      <Card title="BTC" description="由目前 VAC 餘額換算">
        <div className="rounded-2xl bg-neutral-950/70 p-4 text-sm text-neutral-200">
          <p className="text-xs text-neutral-400">Balance</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-100">
            {btcValue === null ? "匯率載入中..." : `${btcValue.toFixed(8)} BTC`}
          </p>
        </div>
      </Card>

      <Card title="ETH" description="由目前 VAC 餘額換算">
        <div className="rounded-2xl bg-neutral-950/70 p-4 text-sm text-neutral-200">
          <p className="text-xs text-neutral-400">Balance</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-100">
            {ethValue === null ? "匯率載入中..." : `${ethValue.toFixed(8)} ETH`}
          </p>
        </div>
      </Card>

      <Card title="USDT" description="由目前 VAC 餘額換算">
        <div className="rounded-2xl bg-neutral-950/70 p-4 text-sm text-neutral-200">
          <p className="text-xs text-neutral-400">Balance</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-100">
            {usdtValue === null
              ? "匯率載入中..."
              : `${usdtValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })} USDT`}
          </p>
        </div>
      </Card>
    </div>
  );
}

