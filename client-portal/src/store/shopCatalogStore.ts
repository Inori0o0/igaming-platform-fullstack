"use client";

import { create } from "zustand";
import { shopProducts } from "@/src/shop/products";
import type { Product } from "@/src/shop/types";

export type CatalogSource = "live" | "mock";

type ShopCatalogState = {
  products: Product[];
  fetchState: "idle" | "loading" | "ok" | "error";
  /**
   * "mock" 代表目前顯示的商品其實是離線示範資料（Supabase 查詢失敗、空表，或前端 fetch 失敗）。
   * 這個欄位刻意跟 `fetchState` 分開：即使 fetch 本身成功（HTTP 200），伺服器也可能是「查詢失敗後
   * 已經內部 fallback 成 mock」才回傳，此時 fetchState 會是 "ok" 但 catalogSource 要標成 "mock"，
   * 否則 UI 完全看不出使用者正在瀏覽/加購假資料（這正是要修的 P0 問題）。
   */
  catalogSource: CatalogSource;
  hydrateFromApi: () => Promise<void>;
  /** 讓已經在 Server Component 拿到目錄的頁面（如 /shop）直接餵資料，不必再讓全站的 client fetch 重查一次。 */
  seedFromServer: (products: Product[], source: CatalogSource) => void;
};

export const useShopCatalogStore = create<ShopCatalogState>((set, get) => ({
  products: shopProducts,
  fetchState: "idle",
  catalogSource: "mock",
  hydrateFromApi: async () => {
    // "ok"：已經有新鮮資料（不論是上一次 fetch 還是被某頁 seedFromServer 餵入），不用重查。
    if (get().fetchState === "loading" || get().fetchState === "ok") return;
    set({ fetchState: "loading" });
    try {
      const res = await fetch("/api/shop/catalog", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as {
        products?: Product[];
        source?: CatalogSource;
      };
      const hasProducts = Array.isArray(body.products) && body.products.length > 0;
      const next = hasProducts ? (body.products as Product[]) : shopProducts;
      // 伺服器沒回傳 source（舊版 API 或非預期回應）時，保守視為 mock，不假設是 live。
      const source: CatalogSource = hasProducts && body.source === "live" ? "live" : "mock";
      set({ products: next, fetchState: "ok", catalogSource: source });
    } catch {
      set({ products: shopProducts, fetchState: "error", catalogSource: "mock" });
    }
  },
  seedFromServer: (products, source) => {
    if (get().fetchState !== "idle" || products.length === 0) return;
    set({ products, fetchState: "ok", catalogSource: source });
  },
}));

export function getShopCatalogSnapshot(): Product[] {
  return useShopCatalogStore.getState().products;
}
