import { ProductCard } from "@/src/components/shop/catalog/ProductCard";
import { ProductCategoryFilter } from "@/src/components/shop/catalog/ProductCategoryFilter";
import type { Product, ProductCategory } from "@/src/shop/types";

type ProductCatalogProps = {
  products: Product[];
  activeCategory?: ProductCategory;
};

/**
 * 商品格線：只有 `ProductCategoryFilter` 需要互動（改網址查詢字串），
 * 這裡改成 Server Component，篩選改成用 `activeCategory`（來自 URL）直接過濾，
 * 避免整頁商品格線因為分類篩選的 `useState` 被迫整棵樹一起送到 client 端 hydrate。
 */
export function ProductCatalog({ products, activeCategory = "all" }: ProductCatalogProps) {
  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <section className="space-y-4">
      <ProductCategoryFilter activeCategory={activeCategory} />

      <p className="text-xs text-neutral-400">
        目前顯示 {filteredProducts.length} 件商品
      </p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
