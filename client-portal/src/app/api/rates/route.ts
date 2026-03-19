import { NextResponse } from "next/server";
import type { UsdtRates } from "@/src/types/rates";

const REFRESH_MS = 60_000;
const VAC_USDT_RATE = 0.01;

// 以進程記憶體做短暫快取，降低第三方 API 呼叫頻率。
let cachedRates: UsdtRates | null = null;
let cachedAt = 0;

async function fetchCoinGeckoRates(): Promise<{ btcUsdt: number; ethUsdt: number }> {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(`CoinGecko error: ${response.status}`);
  }

  const data = (await response.json()) as {
    bitcoin?: { usd?: number };
    ethereum?: { usd?: number };
  };
  const btcUsd = data.bitcoin?.usd;
  const ethUsd = data.ethereum?.usd;

  if (typeof btcUsd !== "number" || typeof ethUsd !== "number") {
    throw new Error("Invalid CoinGecko payload");
  }

  return { btcUsdt: btcUsd, ethUsdt: ethUsd };
}

export async function GET() {
  const now = Date.now();

  // 快取仍有效就直接回傳，避免每次請求都打第三方。
  if (cachedRates && now - cachedAt < REFRESH_MS) {
    return NextResponse.json(cachedRates);
  }

  try {
    const { btcUsdt, ethUsdt } = await fetchCoinGeckoRates();
    const next: UsdtRates = {
      btcUsdt,
      ethUsdt,
      vacUsdt: VAC_USDT_RATE,
      updatedAt: new Date().toISOString(),
      source: "coingecko",
      isStale: false,
    };
    cachedRates = next;
    cachedAt = now;
    return NextResponse.json(next);
  } catch {
    if (cachedRates) {
      // 第三方暫時失敗時，優先回傳舊資料並告知為 stale。
      return NextResponse.json({ ...cachedRates, isStale: true });
    }

    return NextResponse.json(
      { message: "目前無法取得匯率，請稍後再試。" },
      { status: 503 },
    );
  }
}

