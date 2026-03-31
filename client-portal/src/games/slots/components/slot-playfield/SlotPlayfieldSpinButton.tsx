import type { SlotThemeConfig } from "@/src/games/slots/config";

type SlotPlayfieldSpinButtonProps = {
  theme: SlotThemeConfig;
  spinning: boolean;
  totalBet: number;
  vacBalance: number;
  onSpin: () => void;
};

export function SlotPlayfieldSpinButton({
  theme,
  spinning,
  totalBet,
  vacBalance,
  onSpin,
}: SlotPlayfieldSpinButtonProps) {
  // 保持與下注區同一個禁用規則：餘額不足時不能按。
  const cannotAfford = vacBalance < totalBet;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <button
        type="button"
        onClick={onSpin}
        disabled={spinning || cannotAfford}
        className={`h-24 w-full max-w-[20rem] rounded-full border px-8 text-4xl font-black tracking-wider transition disabled:opacity-50 ${theme.visual.buttonPrimary} ${theme.visual.buttonPrimaryHover} shadow-[0_0_42px_rgba(34,211,238,0.65),0_0_72px_rgba(232,121,249,0.32)]`}
      >
        {spinning ? "轉動中…" : "轉動"}
      </button>
    </div>
  );
}
