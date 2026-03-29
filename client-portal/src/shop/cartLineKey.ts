import type { ApparelSize, Product } from "@/src/shop/types";

/**
 * React list key：僅用 `product.id`（slug）會在「同商品不同尺寸」時重複 key；
 * 有 sizeOptions 時改為 `slug::尺寸`，與購物車一列一 key 對齊。
 */
export function cartLineReactKey(
  product: Product,
  lineSize: ApparelSize | undefined,
): string {
  if (product.sizeOptions && product.sizeOptions.length > 0) {
    return `${product.id}::${lineSize ?? "M"}`;
  }
  return product.id;
}
