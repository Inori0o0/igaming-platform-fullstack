"use client";

type ClaimFreeCoinsCTAButtonProps = {
  onClaim: () => void;
  claimedFeedback: boolean;
};

export function ClaimFreeCoinsCTAButton({
  onClaim,
  claimedFeedback,
}: ClaimFreeCoinsCTAButtonProps) {
  return (
    <button
      type="button"
      aria-label="領取 6,767 vAcAnt Coins"
      onClick={onClaim}
      className={[
        "group relative flex w-full cursor-pointer flex-col items-start gap-2 rounded-3xl px-5 py-5 text-left",
        "bg-linear-to-b from-cyan-500/18 to-cyan-900/12 backdrop-blur-sm ring-1 ring-cyan-300/35",
        "shadow-[0_10px_0_rgba(8,145,178,0.45),0_0_35px_rgba(34,211,238,0.2)]",
        "transition duration-150 ease-out hover:scale-[1.01] hover:shadow-[0_12px_0_rgba(8,145,178,0.55),0_0_50px_rgba(34,211,238,0.35)]",
        "active:translate-y-[2px] active:shadow-[0_6px_0_rgba(8,145,178,0.4),0_0_20px_rgba(34,211,238,0.2)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200",
      ].join(" ")}
    >
      <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-cyan-200/40 bg-cyan-400/15 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-cyan-100">
        CLAIM NOW
      </span>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
        免費領取
      </p>
      <p className="text-xl font-extrabold tracking-tight text-cyan-50 sm:text-2xl">
        點我立即領取 6,767 vAcAnt Coins
      </p>
      <p className="text-xs text-neutral-300">
        每次點擊立即入帳，並自動寫入交易紀錄。
      </p>
      {claimedFeedback && (
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-emerald-300/45 bg-emerald-400/20 px-2 py-1 text-[11px] font-semibold text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
          已領取 +6767 Coins
        </span>
      )}
    </button>
  );
}

