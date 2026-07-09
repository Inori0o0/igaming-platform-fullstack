"use client";

import { create } from "zustand";
import { shopProducts } from "@/src/shop/products";
import type { Product } from "@/src/shop/types";

type ShopCatalogState = {
  products: Product[];
  fetchState: "idle" | "loading" | "ok" | "error";
  hydrateFromApi: () => Promise<void>;
  /** 讓已經在 Server Component 拿到目錄的頁面（如 /shop）直接餵資料，不必再讓全站的 client fetch 重查一次。 */
  seedFromServer: (products: Product[]) => void;
};

export const useShopCatalogStore = create<ShopCatalogState>((set, get) => ({
  products: shopProducts,
  fetchState: "idle",
  hydrateFromApi: async () => {
    // "ok"：已經有新鮮資料（不論是上一次 fetch 還是被某頁 seedFromServer 餵入），不用重查。
    if (get().fetchState === "loading" || get().fetchState === "ok") return;
    set({ fetchState: "loading" });
    try {
      const res = await fetch("/api/shop/catalog", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { products?: Product[] };
      const next = Array.isArray(body.products) ? body.products : shopProducts;
      set({
        products: next.length > 0 ? next : shopProducts,
        fetchState: "ok",
      });
    } catch {
      set({ products: shopProducts, fetchState: "error" });
    }
  },
  seedFromServer: (products) => {
    if (get().fetchState !== "idle" || products.length === 0) return;
    set({ products, fetchState: "ok" });
  },
}));

export function getShopCatalogSnapshot(): Product[] {
  return useShopCatalogStore.getState().products;
}
