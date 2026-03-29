import Link from "next/link";
import { Card } from "@/src/components/ui/Card";
import type { ApparelSize, Product } from "@/src/shop/types";
import { cartLineReactKey } from "@/src/shop/cartLineKey";
import { CartLineItem } from "@/src/components/shop/CartLineItem";

type CartRow = {
  product: Product;
  quantity: number;
  lineTotal: number;
  size?: ApparelSize;
};

type CartItemsCardProps = {
  cartRows: CartRow[];
  mode: "physical" | "digital" | null;
  onQuantityChange: (productId: string, quantity: number, size?: ApparelSize) => void;
  onRemove: (productId: string, size?: ApparelSize) => void;
};

export function CartItemsCard({
  cartRows,
  mode,
  onQuantityChange,
  onRemove,
}: CartItemsCardProps) {
  return (
    <Card title="商品列表" description="調整數量或移除">
      {cartRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-6 text-center text-xs text-neutral-400">
          購物車是空的
          <div className="mt-3">
            <Link
              href="/shop"
              className="text-cyan-200 underline underline-offset-4 hover:text-cyan-100"
            >
              去逛逛商店
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-neutral-400">
            目前結帳類型：{mode === "digital" ? "虛擬商品" : "實體商品"}
          </p>
          {cartRows.map((row) => (
            <CartLineItem
              key={cartLineReactKey(row.product, row.size)}
              product={row.product}
              size={row.size}
              quantity={row.quantity}
              lineTotal={row.lineTotal}
              onQuantityChange={(qty) =>
                onQuantityChange(row.product.id, qty, row.size)
              }
              onRemove={() => onRemove(row.product.id, row.size)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
