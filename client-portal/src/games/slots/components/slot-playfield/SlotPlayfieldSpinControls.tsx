/**
 * 轉動按鈕：樣式來自 `theme.visual.buttonPrimary*`，與父層 `spinning` 連動鎖定。
 */
import type { SlotThemeConfig } from "@/src/games/slots/config";

type SlotPlayfieldSpinControlsProps = {
  theme: SlotThemeConfig;
  spinning: boolean;
  onSpin: () => void;
};

export function SlotPlayfieldSpinControls({
  theme,
  spinning,
  onSpin,
}: SlotPlayfieldSpinControlsProps) {
  const v = theme.visual;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onSpin}
        disabled={spinning}
        className={`rounded-full border px-5 py-2 text-xs font-semibold transition disabled:opacity-50 ${v.buttonPrimary} ${v.buttonPrimaryHover}`}
      >
        {spinning ? "轉動中…" : "示範轉動"}
      </button>
      <p className={`text-[11px] ${v.mutedText}`}>
        連線判定已套用（左至右連續相同符號）；獎勵為展示用 VAC，尚未接錢包。
      </p>
    </div>
  );
}
