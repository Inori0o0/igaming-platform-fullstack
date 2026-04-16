"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { ImageLoadingShimmer } from "./ImageLoadingShimmer";

type LoadingImageProps = ImageProps & {
  shimmerClassName?: string;
};

export function LoadingImage({
  alt,
  className,
  shimmerClassName,
  onLoadingComplete,
  onError,
  ...props
}: LoadingImageProps) {
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");

  return (
    <>
      {phase === "loading" ? (
        <ImageLoadingShimmer className={shimmerClassName} />
      ) : null}
      <Image
        {...props}
        alt={alt}
        className={`transition-opacity duration-500 ease-out ${
          phase === "ready" ? "opacity-100" : "opacity-0"
        } ${phase === "error" ? "hidden" : ""} ${className ?? ""}`.trim()}
        onLoadingComplete={(result) => {
          setPhase("ready");
          onLoadingComplete?.(result);
        }}
        onError={(event) => {
          setPhase("error");
          onError?.(event);
        }}
      />
    </>
  );
}
