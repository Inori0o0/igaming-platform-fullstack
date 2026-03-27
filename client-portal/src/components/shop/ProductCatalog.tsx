"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/src/components/shop/ProductCard";
import { Button } from "@/src/components/ui/Button";
import type { Product, ProductCategory } from "@/src/shop/types";
import { productCategories, productCategoryLabels } from "@/src/shop/types";

type ProductCatalogProps = {
  products: Product[];
};

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("all");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") {
      return products;
    }

    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory, products]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {productCategories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            aria-pressed={activeCategory === category}
          >
            {productCategoryLabels[category]}
          </Button>
        ))}
      </div>

      <p className="text-xs text-neutral-400">
        目前顯示 {filteredProducts.length} 件商品
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

