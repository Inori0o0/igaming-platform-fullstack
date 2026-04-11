import { describe, expect, it } from "vitest";
import { calculateCartSummary } from "@/src/store/cartSummary";
import type { Product } from "@/src/shop/types";
import type { CartLineItem, CouponState } from "@/src/store/cartTypes";

function physicalProduct(id: string, priceVac: number, overrides: Partial<Product> = {}): Product {
  return {
    id,
    name: id,
    priceVac,
    category: "apparel",
    fulfillmentType: "physical",
    imageSrc: "/x.png",
    description: "",
    stock: 100,
    sizeOptions: ["M"],
    ...overrides,
  };
}

function digitalProduct(id: string, priceVac: number): Product {
  return {
    id,
    name: id,
    priceVac,
    category: "digital",
    fulfillmentType: "digital",
    imageSrc: "/x.png",
    description: "",
    stock: 100,
    isAvatar: true,
  };
}

describe("calculateCartSummary", () => {
  it("empty cart: zeros and null mode", () => {
    const r = calculateCartSummary([], null, []);
    expect(r).toEqual({
      subtotalVac: 0,
      shippingVac: 0,
      discountVac: 0,
      totalVac: 0,
      mode: null,
    });
  });

  it("physical: subtotal + shipping 60", () => {
    const catalog = [physicalProduct("tee", 100)];
    const items: CartLineItem[] = [{ productId: "tee", quantity: 1, size: "M" }];
    const r = calculateCartSummary(items, null, catalog);
    expect(r.mode).toBe("physical");
    expect(r.subtotalVac).toBe(100);
    expect(r.shippingVac).toBe(60);
    expect(r.discountVac).toBe(0);
    expect(r.totalVac).toBe(160);
  });

  it("SHIPFREE: waives shipping", () => {
    const catalog = [physicalProduct("tee", 100)];
    const items: CartLineItem[] = [{ productId: "tee", quantity: 1, size: "M" }];
    const coupon: CouponState = {
      code: "SHIPFREE",
      discountType: "free_shipping",
      percentOffPoints: 0,
      fixedOffVac: 0,
      description: "免運",
      appliesFulfillment: "physical",
    };
    const r = calculateCartSummary(items, coupon, catalog);
    expect(r.subtotalVac).toBe(100);
    expect(r.shippingVac).toBe(0);
    expect(r.discountVac).toBe(60);
    expect(r.totalVac).toBe(100);
  });

  it("ALL95: 5% off subtotal, any fulfillment", () => {
    const catalog = [physicalProduct("tee", 1000)];
    const items: CartLineItem[] = [{ productId: "tee", quantity: 1, size: "M" }];
    const coupon: CouponState = {
      code: "ALL95",
      discountType: "percentage",
      percentOffPoints: 5,
      fixedOffVac: 0,
      description: "95 折",
      appliesFulfillment: "any",
    };
    const r = calculateCartSummary(items, coupon, catalog);
    expect(r.discountVac).toBe(50);
    expect(r.shippingVac).toBe(60);
    expect(r.totalVac).toBe(1000 + 60 - 50);
  });

  it("DIGI97 applies to digital cart", () => {
    const catalog = [digitalProduct("av", 10000)];
    const items: CartLineItem[] = [{ productId: "av", quantity: 1 }];
    const coupon: CouponState = {
      code: "DIGI97",
      discountType: "percentage",
      percentOffPoints: 3,
      fixedOffVac: 0,
      description: "97 折",
      appliesFulfillment: "digital",
    };
    const r = calculateCartSummary(items, coupon, catalog);
    expect(r.mode).toBe("digital");
    expect(r.subtotalVac).toBe(10000);
    expect(r.shippingVac).toBe(0);
    expect(r.discountVac).toBe(300);
    expect(r.totalVac).toBe(9700);
  });

  it("DIGI97 ignored for physical cart", () => {
    const catalog = [physicalProduct("tee", 1000)];
    const items: CartLineItem[] = [{ productId: "tee", quantity: 1, size: "M" }];
    const coupon: CouponState = {
      code: "DIGI97",
      discountType: "percentage",
      percentOffPoints: 3,
      fixedOffVac: 0,
      description: "97 折",
      appliesFulfillment: "digital",
    };
    const r = calculateCartSummary(items, coupon, catalog);
    expect(r.discountVac).toBe(0);
    expect(r.totalVac).toBe(1060);
  });

  it("physical subtotal 0: no shipping charge", () => {
    const catalog = [physicalProduct("tee", 0)];
    const items: CartLineItem[] = [{ productId: "tee", quantity: 1, size: "M" }];
    const r = calculateCartSummary(items, null, catalog);
    expect(r.subtotalVac).toBe(0);
    expect(r.shippingVac).toBe(0);
    expect(r.totalVac).toBe(0);
  });
});
