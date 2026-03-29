"use client";

import { SplashScreen } from "@/src/components/loading/SplashScreen";

/**
 * /shop 在伺服端抓取目錄時，由 `app/(lobby)/shop/loading.tsx` 掛載。
 * 使用 inline，只覆蓋主內容區，不遮住側欄與頂欄。
 */
export function ShopPageSplashLoading() {
  return (
    <div className="relative min-h-[min(70vh,520px)] w-full">
      <SplashScreen show minVisibleMs={400} mode="inline" />
    </div>
  );
}
