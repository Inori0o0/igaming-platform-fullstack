"use client";

/**
 * 商店分類篩選：唯一需要互動的部分，改用 `<Link href="/shop?category=...">` 更新網址查詢字串，
 * 讓 `ProductCatalog`／`ProductCard` 本身可以維持 Server Component，不用整棵樹一起 hydrate。
 */
import Link from "next/link";
import { cn } from "@/src/lib/cn";
import { productCategories, productCategoryLabels } from "@/src/shop/types";
import type { ProductCategory } from "@/src/shop/types";

type ProductCategoryFilterProps = {
  activeCategory: ProductCategory;
};

export function ProductCategoryFilter({ activeCategory }: ProductCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {productCategories.map((category) => {
        const active = activeCategory === category;
        return (
          <Link
            key={category}
            href={category === "all" ? "/shop" : `/shop?category=${category}`}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80",
              active
                ? "bg-cyan-500 text-black shadow-[0_0_18px_rgba(34,211,238,0.6)]"
                : "border border-transparent bg-transparent text-cyan-100 hover:border-cyan-400/40 hover:bg-cyan-500/10",
            )}
          >
            {productCategoryLabels[category]}
          </Link>
        );
      })}
    </div>
  );
}
