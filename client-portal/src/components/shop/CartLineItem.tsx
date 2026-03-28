import Image from "next/image";
import { Button } from "@/src/components/ui/Button";
import type { Product } from "@/src/shop/types";

type CartLineItemProps = {
  product: Product;
  quantity: number;
  lineTotal: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function CartLineItem({
  product,
  quantity,
  lineTotal,
  onQuantityChange,
  onRemove,
}: CartLineItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-neutral-950/70 p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-cyan-500/20">
        <Image
          src={product.imageSrc}
          alt={product.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-100">{product.name}</p>
        <p className="text-xs text-neutral-400">單價 {product.priceVac.toLocaleString()} VAC</p>
        <p className="text-xs text-cyan-200">小計 {lineTotal.toLocaleString()} VAC</p>
      </div>
      <div className="flex items-center gap-2">
        <select
          aria-label={`${product.name} 數量`}
          className="rounded-lg border border-cyan-500/25 bg-black/30 px-2 py-1 text-xs text-neutral-100"
          value={quantity}
          onChange={(event) => onQuantityChange(Number(event.target.value))}
        >
          {[1, 2, 3, 4, 5].map((qty) => (
            <option key={qty} value={qty}>
              {qty}
            </option>
          ))}
        </select>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          移除
        </Button>
      </div>
    </div>
  );
}
