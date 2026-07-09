"use client";

/** 右側「桌面訊息」區塊：主訊息 + 本局派彩摘要（結算後顯示）。 */
import clsx from "clsx";
import { motion } from "framer-motion";

type StatusPanelProps = {
  eventTone: "info" | "success" | "warning";
  message: string;
  payout: number;
  totalBet: number;
  isSettled: boolean;
};

export function StatusPanel({ eventTone, message, payout, totalBet, isSettled }: StatusPanelProps) {
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
        <p className="h-[28px] truncate text-[13px] leading-[28px] text-neutral-200" title={message}>
          {message}
        </p>
        {isSettled ? (
          <p
            className="min-h-3 shrink-0 truncate text-[10px] leading-3 text-cyan-200"
            title={`本局派彩：${payout}（原始下注 ${totalBet}）`}
          >
            本局派彩：{payout}（原始下注 {totalBet}）
          </p>
        ) : (
          <p className="min-h-3 shrink-0 text-[10px] leading-3 text-cyan-200 opacity-0">
            &nbsp;
          </p>
        )}
      </div>
    </motion.div>
  );
}

