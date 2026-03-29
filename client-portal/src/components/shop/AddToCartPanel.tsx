"use client";

import { AddToCartPanelView } from "@/src/components/shop/addToCart/AddToCartPanelView";
import { useAddToCartPanel } from "@/src/components/shop/addToCart/useAddToCartPanel";
import type { Product } from "@/src/shop/types";

type AddToCartPanelProps = {
  product: Product;
};

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const vm = useAddToCartPanel(product);
  return <AddToCartPanelView product={product} vm={vm} />;
}
