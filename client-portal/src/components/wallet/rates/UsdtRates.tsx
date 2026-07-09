"use client";

import type { UsdtRates as UsdtRatesType } from "@/src/types/rates";

type UsdtRatesProps = {
  rates: UsdtRatesType | null;
  isRatesLoading: boolean;
  ratesError: string | null;
};

export function UsdtRates({ rates, isRatesLoading, ratesError }: UsdtRatesProps) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-neutral-950/70 px-4 py-3 text-xs text-neutral-300">
      {ratesError ? (
        <p>{ratesError}</p>
      ) : isRatesLoading || !rates ? (
        <p>匯率載入中...</p>
      ) : (
        <p>
          USDT 匯率：1 BTC = {rates.btcUsdt.toLocaleString()} / 1 ETH ={" "}
          {rates.ethUsdt.toLocaleString()} / 1 VAC = {rates.vacUsdt}
          {rates.isStale ? " · 目前為快取資料" : ""}
        </p>
      )}
    </div>
  );
}

