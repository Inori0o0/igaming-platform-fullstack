"use client";

import { useMemo } from "react";
import { useShopCatalogStore } from "@/src/store/shopCatalogStore";

export type HomeFeaturedProduct = {
  id: string;
  name: string;
  priceVac: number;
  imageSrc: string;
  category?: "apparel" | "digital" | "collectible";
};

const fallbackFeaturedProduct: HomeFeaturedProduct = {
  id: "vacant-hoodie",
  name: "vAcAnt 黑色連帽上衣",
  priceVac: 5900,
  imageSrc: "/products/vacant_hoodie.webp",
};

export function useFeaturedHomeProduct(): HomeFeaturedProduct {
  const products = useShopCatalogStore((s) => s.products);

  return useMemo(() => {
    const hoodie = products.find((p) => p.id === "vacant-hoodie");
    if (!hoodie) return fallbackFeaturedProduct;
    return {
      id: hoodie.id,
      name: hoodie.name,
      priceVac: hoodie.priceVac,
      imageSrc: hoodie.imageSrc || fallbackFeaturedProduct.imageSrc,
      category: hoodie.category,
    };
  }, [products]);
}
