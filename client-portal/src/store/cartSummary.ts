/**
 * 購物車「小計／運費／折扣／總額」純計算（不依賴 Zustand、不連 Supabase）。
 * 抽出目的：結帳頁與單元測試可共用同一套公式，且測試不必載入 cartStore（避免牽動 supabase client）。
 */
import type { Product } from "@/src/shop/types";
import type {
  CartLineItem,
  CartMode,
  CouponState,
} from "@/src/store/cartTypes";

const PHYSICAL_SHIPPING_FEE = 60;

/** 以購物車第一列對應的商品決定整車 fulfillment（實體／數位）；空車為 null。 */
export function deriveMode(items: CartLineItem[], catalog: Product[]): CartMode {
  if (items.length === 0) return null;
  const first = catalog.find((product) => product.id === items[0]?.productId);
  return first?.fulfillmentType ?? null;
}

export function couponAppliesToMode(coupon: CouponState, mode: CartMode): boolean {
  if (mode === null) return true;
  const scope = coupon.appliesFulfillment;
  if (scope === "any") return true;
  return scope === mode;
}

/**
 * 依目錄價格與優惠券規則計算顯示用金額；`mode` 與 cartStore 內「混合 fulfillment」檢查是分開的。
 */
export function calculateCartSummary(
  items: CartLineItem[],
  coupon: CouponState | null,
  catalog: Product[],
): {
  subtotalVac: number;
  shippingVac: number;
  discountVac: number;
  totalVac: number;
  mode: CartMode;
} {
  const mode = deriveMode(items, catalog);
  const subtotalVac = items.reduce((sum, item) => {
    const product = catalog.find((p) => p.id === item.productId);
    if (!product) return sum;
    return sum + product.priceVac * item.quantity;
  }, 0);

  const baseShipping = mode === "physical" && subtotalVac > 0 ? PHYSICAL_SHIPPING_FEE : 0;

  const effective =
    coupon && (mode === null || couponAppliesToMode(coupon, mode)) ? coupon : null;

  let percentDiscount = 0;
  let fixedDiscount = 0;
  let shippingDiscount = 0;
  if (effective) {
    if (effective.discountType === "percentage") {
      percentDiscount = Math.floor(
        subtotalVac * (effective.percentOffPoints / 100),
      );
    }
    if (effective.discountType === "fixed") {
      fixedDiscount = Math.min(subtotalVac, effective.fixedOffVac);
    }
    if (effective.discountType === "free_shipping") {
      shippingDiscount = Math.min(baseShipping, PHYSICAL_SHIPPING_FEE);
    }
  }

  const discountVac = percentDiscount + fixedDiscount + shippingDiscount;
  const shippingVac = Math.max(0, baseShipping - shippingDiscount);
  const totalVac = Math.max(0, subtotalVac + shippingVac - percentDiscount - fixedDiscount);

  return { subtotalVac, shippingVac, discountVac, totalVac, mode };
}
