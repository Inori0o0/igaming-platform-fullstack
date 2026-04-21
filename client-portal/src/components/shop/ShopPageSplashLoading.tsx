"use client";

import { useEffect, useState } from "react";
import { SplashScreen } from "@/src/components/loading/SplashScreen";

/**
 * /shop 在伺服端抓取目錄時，由 `app/(lobby)/shop/loading.tsx` 掛載。
 * 使用 inline，只覆蓋主內容區，不遮住側欄與頂欄。
 */
export function ShopPageSplashLoading() {
  // 預設先用 fullscreen，避免首幀在小螢幕出現 inline 定位抖動。
  const [mode, setMode] = useState<"fullscreen" | "inline">("fullscreen");

  useEffect(() => {
    // `lg`(1024px) 以上維持 inline（只覆蓋內容區），
    // 手機/平板改 fullscreen，避免重刷與頁面切換時的 inline 破圖。
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateMode = () => {
      setMode(mediaQuery.matches ? "inline" : "fullscreen");
    };

    // 初次掛載與螢幕尺寸改變時都同步 mode。
    updateMode();
    mediaQuery.addEventListener("change", updateMode);

    return () => {
      mediaQuery.removeEventListener("change", updateMode);
    };
  }, []);

  return <SplashScreen show minVisibleMs={400} mode={mode} />;
}
