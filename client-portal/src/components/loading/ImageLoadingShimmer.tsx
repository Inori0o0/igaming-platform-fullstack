"use client";

type ImageLoadingShimmerProps = {
  className?: string;
};

export function ImageLoadingShimmer({
  className = "",
}: ImageLoadingShimmerProps) {
  return (
    <div
      className={`shop-detail-image-shimmer absolute inset-0 z-10 ${className}`.trim()}
      aria-hidden
    />
  );
}
