"use client";

import { useCallback, useEffect, useState } from "react";
import type { UsdtRates } from "@/src/types/rates";

type UseUsdtRatesResult = {
  rates: UsdtRates | null;
  isLoading: boolean;
  error: string | null;
};

const POLL_MS = 60_000;

export function useUsdtRates(): UseUsdtRatesResult {
  const [rates, setRates] = useState<UsdtRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      const response = await fetch("/api/rates", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("匯率服務暫時不可用");
      }

      const data = (await response.json()) as UsdtRates;
      setRates(data);
      // 只要拿到新資料，就清除上一輪錯誤狀態。
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "匯率載入失敗");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 首次進頁立即抓一次，之後每 60 秒自動更新。
    void fetchRates();
    const intervalId = window.setInterval(() => {
      void fetchRates();
    }, POLL_MS);
    return () => window.clearInterval(intervalId);
  }, [fetchRates]);

  return { rates, isLoading, error };
}

