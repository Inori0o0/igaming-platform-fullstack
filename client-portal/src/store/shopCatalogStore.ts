"use client";

import { create } from "zustand";
import { shopProducts } from "@/src/shop/products";
import type { Product } from "@/src/shop/types";

type ShopCatalogState = {
  products: Product[];
  fetchState: "idle" | "loading" | "ok" | "error";
  hydrateFromApi: () => Promise<void>;
};

export const useShopCatalogStore = create<ShopCatalogState>((set, get) => ({
  products: shopProducts,
  fetchState: "idle",
  hydrateFromApi: async () => {
    if (get().fetchState === "loading") return;
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
}));

export function getShopCatalogSnapshot(): Product[] {
  return useShopCatalogStore.getState().products;
}
