/**
 * 組裝 Supabase RPC `checkout_shop_order` 的參數。
 * `product_id` 必須是資料庫 `products.id`（UUID），故使用目錄上的 `dbProductId`，不可傳前端 slug。
 */
import type { Product } from "@/src/shop/types";
import type { CartLineItem, CouponState } from "@/src/store/cartStore";

export type CheckoutRpcLine = {
  product_id: string;
  quantity: number;
  size?: string | null;
};

export function buildCheckoutRpcPayload(
  items: CartLineItem[],
  coupon: CouponState | null,
  catalog: Product[],
  shipping: { recipient: string; phone: string; address: string; note: string },
  mode: "physical" | "digital" | null,
): {
  lines: CheckoutRpcLine[];
  couponCode: string | null;
  shipping: Record<string, string> | null;
} {
  const lines: CheckoutRpcLine[] = items.flatMap((item) => {
    const product = catalog.find((p) => p.id === item.productId);
    if (!product) return [];
    const productId = product.dbProductId;
    if (!productId) {
      throw new Error(
        "無法結帳：商品目錄缺少資料庫編號。請重新整理頁面，或確認商店已從伺服器載入。",
      );
    }
    const line: CheckoutRpcLine = {
      product_id: productId,
      quantity: item.quantity,
    };
    if (product.sizeOptions?.length) {
      line.size = item.size ?? "M";
    }
    return [line];
  });

  const couponCode = coupon?.code?.trim() ? coupon.code.trim() : null;

  const shippingPayload =
    mode === "physical"
      ? {
          recipient: shipping.recipient.trim(),
          phone: shipping.phone.trim(),
          address: shipping.address.trim(),
          note: shipping.note.trim(),
        }
      : null;

  return { lines, couponCode, shipping: shippingPayload };
}
