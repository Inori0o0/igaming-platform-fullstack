"use client";

import { useEffect } from "react";
import { useShopCatalogStore } from "@/src/store/shopCatalogStore";

export function ShopCatalogHydrator() {
  const hydrateFromApi = useShopCatalogStore((s) => s.hydrateFromApi);

  useEffect(() => {
    void hydrateFromApi();
  }, [hydrateFromApi]);

  return null;
}
