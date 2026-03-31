/**
 * 轉輪區上方小標：有橫幅時只顯示格線資訊；無橫幅時多一行「Reels (demo)」。
 */
import type { SlotThemeConfig } from "@/src/games/slots/config";

type SlotPlayfieldShellHeaderProps = {
  theme: SlotThemeConfig;
  hasBanner: boolean;
};

export function SlotPlayfieldShellHeader({
  theme,
  hasBanner,
}: SlotPlayfieldShellHeaderProps) {
  const v = theme.visual;

  if (hasBanner) {
    return (
      <div className={`flex justify-end gap-2 text-[11px] ${v.mutedText}`}>
        <span>
          {theme.grid.rows}×{theme.grid.cols} ·{" "}
          <span className={v.accentText}>{theme.id}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <span className={`text-[11px] ${v.mutedText}`}>
        {theme.grid.rows}×{theme.grid.cols} ·{" "}
        <span className={v.accentText}>{theme.id}</span>
      </span>
    </div>
  );
}
