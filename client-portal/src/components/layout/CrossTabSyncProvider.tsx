"use client";

/**
 * 掛在最外層版面（見 ClientLayoutShell），全站只需要一份監聽：
 * 1. `storage` 事件：修補訪客模式的購物車／錢包在多分頁間的資料落差。
 * 2. 分頁重新可見（visibilitychange/focus）時重新 hydrate：
 *    登入使用者的餘額／購物車在 Supabase，換分頁操作後回來要能看到最新資料，
 *    而不是停留在切走前的舊快照。
 * 不畫任何 UI，只負責掛/收監聽器。
 */
import { useEffect } from "react";
import { attachCartStorageSync, useCartStore } from "@/src/store/cartStore";
import { attachWalletStorageSync, useWalletStore } from "@/src/store/walletStore";

export function CrossTabSyncProvider() {
  useEffect(() => {
    const detachCartStorage = attachCartStorageSync();
    const detachWalletStorage = attachWalletStorageSync();

    const revalidate = () => {
      if (document.visibilityState !== "visible") return;
      void useCartStore.getState().hydrate();
      void useWalletStore.getState().hydrateForCurrentUser();
    };

    document.addEventListener("visibilitychange", revalidate);
    window.addEventListener("focus", revalidate);

    return () => {
      detachCartStorage();
      detachWalletStorage();
      document.removeEventListener("visibilitychange", revalidate);
      window.removeEventListener("focus", revalidate);
    };
  }, []);

  return null;
}
