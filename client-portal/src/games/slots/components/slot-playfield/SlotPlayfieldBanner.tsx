"use client";

/**
 * 頂部橫幅圖 + 疊加主題標題（漸層字 + glow）；圖檔由主題 `titleBannerSrc` 提供。
 */
import clsx from "clsx";
import Image from "next/image";

type SlotPlayfieldBannerProps = {
  bannerSrc: string;
  title: string;
};

export function SlotPlayfieldBanner({
  bannerSrc,
  title,
}: SlotPlayfieldBannerProps) {
  return (
    <div className="relative mx-auto flex w-full max-w-4xl justify-center px-1">
      <Image
        src={bannerSrc}
        alt=""
        width={1200}
        height={240}
        className="h-auto w-full object-contain"
        priority
      />
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 sm:px-12"
        aria-hidden
      >
        <span
          className={clsx(
            "inline-block max-w-[95%] text-center font-black tracking-tight",
            "text-2xl max-[380px]:text-xl sm:text-4xl md:text-6xl lg:text-7xl",
            "bg-linear-to-r from-cyan-200 via-white to-fuchsia-400 bg-clip-text text-transparent",
            "filter-[drop-shadow(0_0_1px_rgba(255,255,255,0.95))_drop-shadow(0_0_14px_rgba(34,211,238,0.9))_drop-shadow(0_0_28px_rgba(232,121,249,0.45))]",
          )}
        >
          {title}
        </span>
      </div>
    </div>
  );
}
