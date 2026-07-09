"use client";

/**
 * 機台外框 PNG：中央 `inset-*` 挖洞區放入轉輪 grid（需與美術安全區對齊，斷點可微調）。
 */
import clsx from "clsx";
import Image from "next/image";
import type { ReactNode } from "react";

type SlotPlayfieldReelFrameProps = {
  frameSrc: string;
  children: ReactNode;
};

export function SlotPlayfieldReelFrame({
  frameSrc,
  children,
}: SlotPlayfieldReelFrameProps) {
  return (
    // 固定 2:1 與 max 寬，讓不同主題框圖都落在同一尺寸規格。
    <div className="relative mx-auto mt-4 w-full max-w-272 aspect-2/1">
      <Image
        src={frameSrc}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 80rem"
        className="block select-none object-contain"
        priority
      />
      <div
        className={clsx(
          "absolute flex items-center justify-center overflow-hidden",
          "inset-[13%_4%_17%_4%]",
          "sm:inset-[12%_6%_15%_6%]",
          "md:inset-[11%_8%_14%_8%]",
          "lg:inset-[11%_9%_15%_9%]",
        )}
      >
        <div className="flex max-h-full w-full max-w-full items-center justify-center overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
