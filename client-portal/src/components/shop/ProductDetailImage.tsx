"use client";

import Image from "next/image";
import { useState } from "react";

type ProductDetailImageProps = {
  src: string;
  alt: string;
  sizes?: string;
};

export function ProductDetailImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 60vw, 100vw",
}: ProductDetailImageProps) {
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");

  const showShimmer = phase === "loading";

  return (
    <div className="relative aspect-square overflow-hidden bg-neutral-950">
      {showShimmer && (
        <div
          className="shop-detail-image-shimmer absolute inset-0 z-10"
          aria-hidden
        />
      )}
      {phase === "error" && (
        <div className="absolute inset-0 z-5 flex items-center justify-center bg-neutral-950 px-4 text-center text-xs text-neutral-500">
          圖片載入失敗
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-500 ease-out ${
          phase === "ready" ? "opacity-100" : "opacity-0"
        } ${phase === "error" ? "hidden" : ""}`}
        sizes={sizes}
        onLoadingComplete={() => setPhase("ready")}
        onError={() => setPhase("error")}
        priority
      />
    </div>
  );
}
