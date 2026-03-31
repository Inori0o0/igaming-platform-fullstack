"use client";

import { useEffect, useState } from "react";

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
  imageSrc: "/products/vacant_hoodie.png",
};

type CatalogResponse = {
  products?: Array<{
    id: string;
    name: string;
    priceVac: number;
    category?: "apparel" | "digital" | "collectible";
    imageSrc?: string;
  }>;
};

export function useFeaturedHomeProduct() {
  const [featuredProduct, setFeaturedProduct] = useState<HomeFeaturedProduct>(
    fallbackFeaturedProduct,
  );

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedProduct = async () => {
      try {
        const response = await fetch("/api/shop/catalog", { cache: "no-store" });
        if (!response.ok) return;

        const json = (await response.json()) as CatalogResponse;
        const hoodie = json.products?.find((product) => product.id === "vacant-hoodie");
        if (!isMounted || !hoodie) return;

        setFeaturedProduct((prev) => ({
          id: hoodie.id,
          name: hoodie.name,
          priceVac: hoodie.priceVac,
          imageSrc: hoodie.imageSrc || prev.imageSrc || fallbackFeaturedProduct.imageSrc,
          category: hoodie.category ?? prev.category,
        }));
      } catch {
        // Keep fallback data when API is unavailable.
      }
    };

    void loadFeaturedProduct();
    return () => {
      isMounted = false;
    };
  }, []);

  return featuredProduct;
}
