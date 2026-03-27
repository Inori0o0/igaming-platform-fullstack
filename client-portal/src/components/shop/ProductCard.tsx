import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/src/shop/types";
import { productCategoryLabels } from "@/src/shop/types";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/shop/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-cyan-500/20 bg-neutral-950/70 transition hover:border-cyan-400/40"
    >
      <div className="relative aspect-square">
        <Image
          src={product.imageSrc}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 100vw"
        />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-50">{product.name}</p>
            <p className="mt-1 text-[11px] text-neutral-400">
              {productCategoryLabels[product.category]}
            </p>
          </div>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-cyan-100">
            {product.priceVac.toLocaleString()} VAC
          </span>
        </div>
        <p className="text-xs leading-relaxed text-neutral-300">{product.description}</p>
      </div>
    </Link>
  );
}

