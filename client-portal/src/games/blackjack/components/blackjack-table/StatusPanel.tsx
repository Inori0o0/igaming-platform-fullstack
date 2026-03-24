"use client";

/**
 * 桌面訊息：固定高度、主訊息單行 truncate（避免長文撐爆版面），結算後顯示總派彩與 tier 徽章。
 */
import clsx from "clsx";
import { motion } from "framer-motion";
import { tierLabel } from "./helpers";
import type { RoundState } from "./types";

type StatusPanelProps = {
  eventTone: "info" | "success" | "warning";
  message: string;
  topTierGroup: "five-cards" | "twenty-one" | "normal";
  topTier?: RoundState["settled"][number]["handTier"];
  round: RoundState | null;
};

export function StatusPanel({ eventTone, message, topTierGroup, topTier, round }: StatusPanelProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className={clsx(
        "rounded-xl border bg-neutral-950/70 p-2.5",
        eventTone === "success" && "border-emerald-400/35",
        eventTone === "warning" && "border-amber-400/35",
        eventTone === "info" && "border-cyan-500/15",
      )}
    >
      <p className="text-[11px] text-neutral-400">桌面訊息</p>
      <div className="mt-1 flex min-h-[58px] flex-col gap-0.5">
        <p
          className="h-[28px] truncate text-[13px] leading-[28px] text-neutral-200"
          title={message}
        >
          {message}
        </p>
        {topTierGroup !== "normal" ? (
          <span
            className={clsx(
              "inline-flex h-4 min-h-4 shrink-0 items-center rounded-full border px-2 py-0 text-[10px] font-semibold leading-none",
              topTierGroup === "five-cards"
                ? "border-emerald-300/70 bg-emerald-500/15 text-emerald-100"
                : "border-amber-300/70 bg-amber-500/15 text-amber-100",
            )}
          >
            {topTier ? tierLabel(topTier) : ""}
          </span>
        ) : (
          <span className="inline-flex h-4 min-h-4 shrink-0 items-center rounded-full border border-transparent px-2 py-0 text-[10px] opacity-0">
            placeholder
          </span>
        )}
        {round?.phase === "settled" ? (
          <p
            className="min-h-3 shrink-0 truncate text-[10px] leading-3 text-cyan-200"
            title={`本局總派彩：${round.payout}（原始總下注 ${round.hands.reduce((s, h) => s + h.wager, 0)}）`}
          >
            本局總派彩：{round.payout}（原始總下注 {round.hands.reduce((s, h) => s + h.wager, 0)}）
          </p>
        ) : (
          <p className="min-h-3 shrink-0 text-[10px] leading-3 text-cyan-200 opacity-0">placeholder</p>
        )}
      </div>
    </motion.div>
  );
}
