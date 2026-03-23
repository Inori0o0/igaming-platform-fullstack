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
    <div className="relative mx-auto mt-4 w-full max-w-5xl">
      <Image
        src={frameSrc}
        alt=""
        width={1600}
        height={800}
        className="block h-auto w-full select-none object-contain"
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
