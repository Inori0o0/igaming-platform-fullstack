/**
 * 購物車專用型別（與 UI slug 對齊的 productId、優惠券狀態、列項目）。
 * 與 cartStore 分檔：讓 stock／結帳 payload／summary 測試可只 import 此檔，不觸發 client bundle 副作用。
 */
import type { ApparelSize } from "@/src/shop/types";

export type CartMode = "physical" | "digital" | null;

export type CouponFulfillmentScope = "physical" | "digital" | "any";

export type CouponState = {
  code: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  /** 百分比折扣點數（例：3 = 97 折、5 = 95 折）；非百分比券為 0 */
  percentOffPoints: number;
  /** 固定金額折扣 VAC；非固定金額券為 0 */
  fixedOffVac: number;
  description: string;
  appliesFulfillment: CouponFulfillmentScope;
};

export type CartLineItem = {
  productId: string;
  quantity: number;
  /** 有 sizeOptions 的商品必填（由 UI 預設 M） */
  size?: ApparelSize;
};
