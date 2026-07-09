"use client";

import Link from "next/link";
import { LoadingImage } from "@/src/components/loading/LoadingImage";
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
        <LoadingImage
          src={product.imageSrc}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
        />
      </div>
      <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
        <div className="min-w-0">
          <p className="wrap-break-word text-xs font-semibold leading-snug text-neutral-50 sm:text-sm">
            {product.name}
          </p>
          <p className="mt-1 text-[10px] text-neutral-400 sm:text-[11px]">
            {productCategoryLabels[product.category]}
          </p>
        </div>
        <span className="inline-block w-fit whitespace-nowrap rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-semibold tracking-widest text-cyan-100 sm:text-[10px] sm:tracking-[0.14em]">
          {product.priceVac.toLocaleString()} VAC
        </span>
        <p className="line-clamp-2 text-[11px] leading-relaxed text-neutral-300 sm:text-xs">
          {product.description}
        </p>
      </div>
    </Link>
  );
}
