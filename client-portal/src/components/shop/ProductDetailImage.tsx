"use client";

import { useState } from "react";

import { LoadingImage } from "@/src/components/loading/LoadingImage";

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
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative aspect-square overflow-hidden bg-neutral-950">
      {hasError && (
        <div className="absolute inset-0 z-5 flex items-center justify-center bg-neutral-950 px-4 text-center text-xs text-neutral-500">
          圖片載入失敗
        </div>
      )}
      <LoadingImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
        onError={() => setHasError(true)}
        priority
      />
    </div>
  );
}
