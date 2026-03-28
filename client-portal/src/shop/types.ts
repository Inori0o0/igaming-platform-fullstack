export const productCategories = ["all", "apparel", "digital", "collectible"] as const;

export const apparelSizes = ["XS", "S", "M", "L", "XL"] as const;
export type ApparelSize = (typeof apparelSizes)[number];

export type ProductCategory = (typeof productCategories)[number];

export type Product = {
  id: string;
  name: string;
  priceVac: number;
  category: Exclude<ProductCategory, "all">;
  fulfillmentType: "physical" | "digital";
  isAvatar?: boolean;
  /** 有值時需在加入購物車時選尺寸（僅部分服飾） */
  sizeOptions?: readonly ApparelSize[];
  imageSrc: string;
  description: string;
  stock: number;
};

export const productCategoryLabels: Record<ProductCategory, string> = {
  all: "全部",
  apparel: "服飾",
  digital: "數位商品",
  collectible: "收藏品",
};

