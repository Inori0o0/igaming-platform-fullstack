"use client";

/**
 * 讓已經在 Server Component（/shop page）拿到 shop catalog 的頁面，把資料同步餵進全站共用的
 * `shopCatalogStore`，這樣掛在 layout 的 `ShopCatalogHydrator` 就不用再對 `/api/shop/catalog`
 * 補一次一模一樣的查詢。
 *
 * 故意在 render 階段（不是 useEffect）呼叫 `seedFromServer`：React 會先完整 render 整棵樹、
 * 才進入 commit 後的 effect 階段，所以無論 `ShopCatalogHydrator` 在 JSX 裡排在前面或後面，
 * 這裡的 seed 一定先於它的 `hydrateFromApi` effect 生效，兩者才不會前後打兩次一樣的請求。
 * `seedFromServer` 本身只在 store 還是 idle 時才寫入，重複呼叫（如 React Strict Mode 重跑一次
 * render）不會覆蓋掉之後已經存在的新鮮資料。
 */
import { useShopCatalogStore, type CatalogSource } from "@/src/store/shopCatalogStore";
import type { Product } from "@/src/shop/types";

type ShopCatalogSeedProps = {
  products: Product[];
  source: CatalogSource;
};

export function ShopCatalogSeed({ products, source }: ShopCatalogSeedProps) {
  useShopCatalogStore.getState().seedFromServer(products, source);
  return null;
}
