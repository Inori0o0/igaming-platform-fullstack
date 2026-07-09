"use client";

import Link from "next/link";
import { LoadingImage } from "@/src/components/loading/LoadingImage";
import { productCategoryLabels } from "@/src/shop/types";
import { useFeaturedHomeProduct } from "@/src/components/home/featured-product/useFeaturedHomeProduct";

export function HomeFeaturedProductCard() {
  const featuredProduct = useFeaturedHomeProduct();

  return (
    <Link
      href={`/shop/${featuredProduct.id}`}
      className="group block overflow-hidden rounded-2xl border border-cyan-500/20 bg-neutral-950/80 transition hover:border-cyan-400/40"
    >
      <div className="relative aspect-square w-full">
        <LoadingImage
          src={featuredProduct.imageSrc}
          alt={featuredProduct.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      </div>
      <div className="space-y-2 px-3.5 py-3">
        <div className="min-w-0">
          <p className="wrap-break-word text-sm font-semibold text-neutral-50">
            {featuredProduct.name}
          </p>
          {featuredProduct.category ? (
            <p className="mt-1 text-[11px] text-neutral-400">
              {productCategoryLabels[featuredProduct.category]}
            </p>
          ) : null}
        </div>
        <span className="inline-block w-fit whitespace-nowrap rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-cyan-100">
          {featuredProduct.priceVac.toLocaleString()} VAC
        </span>
      </div>
    </Link>
  );
}
