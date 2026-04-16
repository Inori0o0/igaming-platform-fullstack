"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import clsx from "clsx";
import { LoadingImage } from "@/src/components/loading/LoadingImage";
import type { SlotGameAvailabilityStatus } from "@/src/games/slots/config/gameAvailability";

export type GameThemeCardProps = {
  href: string;
  /** 無文字封面圖（建議直式或裁成 4:5 構圖） */
  imageSrc?: string;
  imageAlt: string;
  /** 主標題，可含換行；會以全大寫顯示 */
  title: string;
  /** 底部小字（如廠牌、系列名） */
  subtitle?: string;
  /** 右上角小標籤：遊戲類型（如 Slots、Table），非主題／風格名稱 */
  tag?: string;
  /** 無圖時的占位背景 */
  fallback?: ReactNode;
  /** 未傳則視為開放；非 open 時不可點入、圖片灰階並顯示狀態 */
  availability?: SlotGameAvailabilityStatus;
};

/**
 * 大廳用遊戲圖卡（4:5）：全幅插圖 + 底部暗角漸層 + 疊字標題。
 * 文字不燒在圖上；`availability` 非 `open` 時不可點入、灰階並顯示維護／即將開放。
 */
export function GameThemeCard({
  href,
  imageSrc,
  imageAlt,
  title,
  subtitle,
  tag,
  fallback,
  availability = "open",
}: GameThemeCardProps) {
  const playable = availability === "open";

  const shellClassName = clsx(
    "group relative block aspect-4/5 w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset] transition",
    playable &&
      "hover:border-cyan-400/35 hover:shadow-[0_12px_40px_-12px_rgba(34,211,238,0.25)]",
    !playable && "cursor-not-allowed",
  );

  const content = (
    <>
      {imageSrc ? (
        <LoadingImage
          src={imageSrc}
          alt={imageAlt}
          fill
          className={clsx(
            "object-cover",
            playable && "group-hover:scale-[1.04]",
            !playable && "grayscale-65",
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      ) : (
        (fallback ?? (
          <div className="absolute inset-0 bg-linear-to-br from-neutral-800 via-neutral-900 to-neutral-950" />
        ))
      )}

      <div
        className={clsx(
          "pointer-events-none absolute inset-0 bg-linear-to-t",
          playable
            ? "from-black/88 via-black/45 to-transparent"
            : "from-black/84 via-black/45 to-transparent",
        )}
        aria-hidden
      />

      {!playable ? (
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/36 p-4"
          aria-hidden
        >
          <span className="rounded-lg border border-white/25 bg-black/75 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm">
            {availability === "maintenance" ? "維護中" : "即將開放"}
          </span>
        </div>
      ) : null}

      {tag ? (
        <span className="absolute right-3 top-3 z-30 rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur-sm">
          {tag}
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-30 p-4 pb-5 text-center sm:p-5">
        <h2 className="whitespace-pre-line text-lg font-bold uppercase leading-[1.05] tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
            {subtitle}
          </p>
        ) : null}
        {playable ? (
          <p className="mt-4 text-[11px] font-semibold text-cyan-200/90 transition group-hover:text-cyan-100">
            開始遊玩 →
          </p>
        ) : (
          <p className="mt-4 text-[11px] font-semibold text-amber-200/95">
            {availability === "maintenance" ? "維護中" : "即將開放"}
          </p>
        )}
      </div>
    </>
  );

  if (playable) {
    return (
      <Link href={href} className={shellClassName}>
        {content}
      </Link>
    );
  }

  return (
    <div
      className={shellClassName}
      role="group"
      aria-label={`${title}：${availability === "maintenance" ? "維護中" : "即將開放"}`}
    >
      {content}
    </div>
  );
}
