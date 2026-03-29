import type { ApparelSize, Product } from "@/src/shop/types";

/**
 * 可購庫存上限：有尺寸時用 product_variants 該尺寸的 stock_quantity；
 * 無尺寸（單一 NULL variant）用加總後的 product.stock。
 * mock 商品若無 stockBySize，有 sizeOptions 時退回整體 product.stock。
 */
export function stockAvailableForLine(
  product: Product,
  size?: ApparelSize,
): number {
  if (product.stock <= 0) return 0;
  if (product.sizeOptions?.length) {
    const s = size ?? "M";
    const per = product.stockBySize?.[s];
    if (per !== undefined) return per;
    return product.stock;
  }
  return product.stock;
}
