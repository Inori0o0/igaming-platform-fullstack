import { describe, expect, it } from "vitest";
import { buildCheckoutRpcPayload } from "@/src/lib/shopCheckout";
import type { Product } from "@/src/shop/types";
import type { CartLineItem, CouponState } from "@/src/store/cartTypes";

const shipping = {
  recipient: " A ",
  phone: " 0912 ",
  address: " 路 ",
  note: " 備 ",
};

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "vacant-tee",
    name: "Tee",
    priceVac: 100,
    category: "apparel",
    fulfillmentType: "physical",
    imageSrc: "/t.png",
    description: "",
    stock: 10,
    sizeOptions: ["S", "M", "L"],
    dbProductId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    ...overrides,
  };
}

describe("buildCheckoutRpcPayload", () => {
  it("maps slug id to dbProductId and trims shipping for physical", () => {
    const catalog = [product()];
    const items: CartLineItem[] = [{ productId: "vacant-tee", quantity: 2, size: "L" }];
    const coupon: CouponState | null = {
      code: "SHIPFREE",
      discountType: "free_shipping",
      percentOffPoints: 0,
      fixedOffVac: 0,
      description: "免運",
      appliesFulfillment: "physical",
    };

    const out = buildCheckoutRpcPayload(items, coupon, catalog, shipping, "physical");

    expect(out.lines).toEqual([
      {
        product_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        quantity: 2,
        size: "L",
      },
    ]);
    expect(out.couponCode).toBe("SHIPFREE");
    expect(out.shipping).toEqual({
      recipient: "A",
      phone: "0912",
      address: "路",
      note: "備",
    });
  });

  it("omits size when product has no sizeOptions", () => {
    const catalog = [
      product({
        id: "bag",
        sizeOptions: undefined,
        dbProductId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      }),
    ];
    const items: CartLineItem[] = [{ productId: "bag", quantity: 1 }];
    const out = buildCheckoutRpcPayload(items, null, catalog, shipping, "physical");
    expect(out.lines).toHaveLength(1);
    const line = out.lines[0]!;
    expect(line).toEqual({
      product_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      quantity: 1,
    });
    expect(line.size).toBeUndefined();
  });

  it("sets shipping to null for digital checkout", () => {
    const catalog = [
      product({
        fulfillmentType: "digital",
        isAvatar: true,
        dbProductId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      }),
    ];
    const items: CartLineItem[] = [{ productId: "vacant-tee", quantity: 1 }];
    const out = buildCheckoutRpcPayload(items, null, catalog, shipping, "digital");
    expect(out.shipping).toBeNull();
  });

  it("throws when dbProductId is missing", () => {
    const catalog = [product({ dbProductId: undefined })];
    const items: CartLineItem[] = [{ productId: "vacant-tee", quantity: 1 }];
    expect(() =>
      buildCheckoutRpcPayload(items, null, catalog, shipping, "physical"),
    ).toThrow(/資料庫編號/);
  });

  it("returns null coupon code when coupon is null", () => {
    const catalog = [product()];
    const items: CartLineItem[] = [{ productId: "vacant-tee", quantity: 1 }];
    const out = buildCheckoutRpcPayload(items, null, catalog, shipping, "physical");
    expect(out.couponCode).toBeNull();
  });
});
