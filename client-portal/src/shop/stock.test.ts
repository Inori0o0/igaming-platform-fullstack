import { describe, expect, it } from "vitest";
import type { Product } from "@/src/shop/types";
import { stockAvailableForLine } from "@/src/shop/stock";

function baseProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "P",
    priceVac: 100,
    category: "apparel",
    fulfillmentType: "physical",
    imageSrc: "/x.png",
    description: "",
    stock: 100,
    ...overrides,
  };
}

describe("stockAvailableForLine", () => {
  it("returns 0 when product.stock is 0", () => {
    const p = baseProduct({ stock: 0 });
    expect(stockAvailableForLine(p)).toBe(0);
    expect(stockAvailableForLine(p, "M")).toBe(0);
  });

  it("uses stockBySize when sizeOptions exist", () => {
    const p = baseProduct({
      sizeOptions: ["S", "M"],
      stock: 999,
      stockBySize: { S: 3, M: 7 },
    });
    expect(stockAvailableForLine(p, "S")).toBe(3);
    expect(stockAvailableForLine(p, "M")).toBe(7);
  });

  it("falls back to product.stock per size when stockBySize missing for that size", () => {
    const p = baseProduct({
      sizeOptions: ["S", "M"],
      stock: 42,
      stockBySize: { M: 5 },
    });
    expect(stockAvailableForLine(p, "S")).toBe(42);
    expect(stockAvailableForLine(p, "M")).toBe(5);
  });

  it("defaults size to M when sizing applies", () => {
    const p = baseProduct({
      sizeOptions: ["M"],
      stock: 10,
      stockBySize: { M: 8 },
    });
    expect(stockAvailableForLine(p)).toBe(8);
  });

  it("uses product.stock when no sizeOptions", () => {
    const p = baseProduct({ stock: 12 });
    expect(stockAvailableForLine(p)).toBe(12);
  });
});
