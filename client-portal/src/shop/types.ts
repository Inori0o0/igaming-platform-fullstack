export const productCategories = ["all", "apparel", "digital", "collectible"] as const;

export const apparelSizes = ["XS", "S", "M", "L", "XL"] as const;
export type ApparelSize = (typeof apparelSizes)[number];

export type ProductCategory = (typeof productCategories)[number];

export type Product = {
  /** URL／購物車用穩定鍵，對應 Supabase `products.slug` */
  id: string;
  /** Supabase `products.id`（UUID）；結帳 RPC 必填，僅線上目錄有值 */
  dbProductId?: string;
  name: string;
  priceVac: number;
  category: Exclude<ProductCategory, "all">;
  fulfillmentType: "physical" | "digital";
  isAvatar?: boolean;
  /** 有值時需在加入購物車時選尺寸（僅部分服飾） */
  sizeOptions?: readonly ApparelSize[];
  /**
   * 與 Supabase product_variants 對齊：各尺寸的 stock_quantity。
   * 無尺寸商品通常不帶此欄，僅使用 stock。
   */
  stockBySize?: Partial<Record<ApparelSize, number>>;
  imageSrc: string;
  description: string;
  /** 全規格庫存加總（或單一無尺寸列）；用於列表與 force_sold_out */
  stock: number;
};

export const productCategoryLabels: Record<ProductCategory, string> = {
  all: "全部",
  apparel: "服飾",
  digital: "數位商品",
  collectible: "收藏品",
};

