/**
 * 遊戲區下方兩張卡：左為下注參數摘要，右為 paytable 列表（皆自 theme 唯讀展示）。
 */
import { Card } from "@/src/components/ui/Card";
import type { SlotThemeConfig } from "@/src/games/slots/config";

type SlotPlayfieldSidebarProps = {
  theme: SlotThemeConfig;
  totalBet: number;
};

export function SlotPlayfieldSidebar({
  theme,
  totalBet,
}: SlotPlayfieldSidebarProps) {
  const minTotalBet = Math.max(1, Math.floor(theme.betting.min));
  const maxTotalBet = Math.max(minTotalBet, Math.floor(theme.betting.max));
  const betStepOptions = "100 / 1000 / 10000";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card
        title="下注區（config + UI）"
        description="主題提供 default，下注範圍與跳額依目前前端規則。"
      >
        <div className="grid gap-2 text-xs text-neutral-300">
          <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
            <span>Theme default bet</span>
            <span className={theme.visual.accentText}>
              {theme.betting.defaultBet}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
            <span>總下注範圍（目前）</span>
            <span className={theme.visual.accentText}>
              {minTotalBet} / {maxTotalBet}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
            <span>跳額選項（目前）</span>
            <span className={theme.visual.accentText}>{betStepOptions}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
            <span>Paylines</span>
            <span className={theme.visual.accentText}>
              {theme.paylines.length}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
            <span>目前總下注</span>
            <span className={theme.visual.accentText}>{Math.round(totalBet)}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
            <span>Features</span>
            <span className={theme.visual.accentText}>
              {theme.featureIds.length === 0
                ? "無（此主題）"
                : theme.featureIds.join(", ")}
            </span>
          </div>
        </div>
      </Card>

      <Card
        title="獎勵表（自 config）"
        description="連線倍率來自 config；與本局結算一致。"
      >
        <div className="max-h-48 space-y-1 overflow-y-auto text-[11px] text-neutral-300">
          {theme.paytable.map((row) => {
            const sym = theme.symbols.find((s) => s.id === row.symbolId);
            return (
              <div
                key={`${row.symbolId}-${row.count}`}
                className="flex items-center justify-between rounded-lg bg-neutral-950/70 px-2 py-1.5"
              >
                <span>
                  {sym?.name ?? row.symbolId} ×{row.count}
                </span>
                <span className={theme.visual.accentText}>
                  ×{row.multiplier}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
