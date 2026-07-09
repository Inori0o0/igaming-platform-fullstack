"use client";

import { Card } from "@/src/components/ui/Card";
import type { WalletBalances, WalletHydrateStatus } from "@/src/store/walletStore";
import type { UsdtRates } from "@/src/types/rates";

type BalanceCardsProps = {
  balances: WalletBalances;
  rates: UsdtRates | null;
  hydrateStatus?: WalletHydrateStatus;
  hydrateError?: string | null;
  onRetryHydrate?: () => void;
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
  hydrateStatus,
  hydrateError,
  onRetryHydrate,
}: BalanceCardsProps) {
  const vac = balances.VAC;
  const usdtValue = rates ? vac * rates.vacUsdt : null;
  const btcValue = toBtcFromVac(vac, rates);
  const ethValue = toEthFromVac(vac, rates);
  const hasHydrateError = hydrateStatus === "error";

  return (
    <div className="space-y-3">
      {hasHydrateError ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          <span>
            {hydrateError ?? "無法讀取最新餘額，以下顯示的可能是舊資料。"}
          </span>
          {onRetryHydrate ? (
            <button
              type="button"
              onClick={onRetryHydrate}
              className="rounded-full border border-amber-400/40 px-3 py-1 font-semibold text-amber-100 transition hover:bg-amber-500/15"
            >
              重試
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card title="vAcAnt Coins" description="主幣別（充值與提領使用）">
          <div className="rounded-2xl bg-neutral-950/70 p-4 text-sm text-neutral-200">
            <p className="text-xs text-neutral-400">Balance</p>
            <p
              className={
                hasHydrateError
                  ? "mt-2 text-2xl font-semibold text-amber-200"
                  : "mt-2 text-2xl font-semibold text-cyan-100"
              }
            >
              {hasHydrateError ? "餘額讀取失敗" : `${vac.toLocaleString()} VAC`}
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
    </div>
  );
}

