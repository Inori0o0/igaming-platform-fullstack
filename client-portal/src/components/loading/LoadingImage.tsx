"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

import { ImageLoadingShimmer } from "./ImageLoadingShimmer";

type LoadingImageProps = ImageProps & {
  shimmerClassName?: string;
};

export function LoadingImage({
  alt,
  className,
  shimmerClassName,
  onLoad,
  onError,
  ...props
}: LoadingImageProps) {
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // 瀏覽器快取命中時，<img> 在這個元件 mount 前就已經載入完成，不會再觸發 onLoad，
    // 畫面就會卡在 opacity-0（圖片看起來像消失了）。這裡用 img.complete 補一次檢查，
    // naturalWidth > 0 用來排除「載入失敗但 complete 仍為 true」的邊界情況。
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setPhase("ready");
    }
  }, []);

  return (
    <>
      {phase === "loading" ? (
        <ImageLoadingShimmer className={shimmerClassName} />
      ) : null}
      <Image
        {...props}
        ref={imgRef}
        alt={alt}
        className={`transition-opacity duration-500 ease-out ${
          phase === "ready" ? "opacity-100" : "opacity-0"
        } ${phase === "error" ? "hidden" : ""} ${className ?? ""}`.trim()}
        onLoad={(event) => {
          setPhase("ready");
          onLoad?.(event);
        }}
        onError={(event) => {
          setPhase("error");
          onError?.(event);
        }}
      />
    </>
  );
}
