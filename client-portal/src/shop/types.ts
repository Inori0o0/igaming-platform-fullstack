export const productCategories = ["all", "apparel", "digital", "collectible"] as const;

export type ProductCategory = (typeof productCategories)[number];

export type Product = {
  id: string;
  name: string;
  priceVac: number;
  category: Exclude<ProductCategory, "all">;
  imageSrc: string;
  description: string;
  stock: number | null;
};

export const productCategoryLabels: Record<ProductCategory, string> = {
  all: "全部",
  apparel: "服飾",
  digital: "數位商品",
  collectible: "收藏品",
};

