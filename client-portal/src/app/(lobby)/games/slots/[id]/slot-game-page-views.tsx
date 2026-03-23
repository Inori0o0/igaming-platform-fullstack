/**
 * `/games/slots/[id]` 各分支畫面：由 page.tsx 依主題／可用性選擇，此檔不處理路由參數。
 */
import Link from "next/link";
import { Card } from "@/src/components/ui/Card";
import { SlotThemedPlayfield } from "@/src/games/slots/components/SlotThemedPlayfield";
import type { SlotThemeConfig } from "@/src/games/slots/config";

function SlotsGameEyebrow() {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
      Slots Game
    </p>
  );
}

function SlotsBackToListLink() {
  return (
    <Link
      href="/games/slots"
      className="inline-flex rounded-full border border-cyan-500/20 bg-neutral-950/70 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:border-cyan-400/40 hover:bg-neutral-950/90"
    >
      ← 回列表
    </Link>
  );
}

export type ComingSoonPlaceholder = {
  headline: string;
  tagline?: string;
};

/** 無 SlotThemeConfig，但有 SLOT_COMING_SOON_META（僅圖卡上架）。 */
export function SlotGameComingSoonPlaceholderView({
  placeholder,
}: {
  placeholder: ComingSoonPlaceholder;
}) {
  return (
    <main className="space-y-6">
      <div>
        <SlotsGameEyebrow />
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          {placeholder.headline}
        </h1>
        <p className="mt-2 inline-flex rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-100">
          即將開放
        </p>
        <p className="mt-3 max-w-2xl text-sm text-neutral-300">
          {placeholder.tagline ?? "此主題尚未開放，敬請期待。"}
        </p>
      </div>
      <SlotsBackToListLink />
    </main>
  );
}

/** 不認得的 id，且非 coming-soon placeholder。 */
export function SlotGameUnknownThemeView({ id }: { id: string }) {
  return (
    <main className="space-y-6">
      <div>
        <SlotsGameEyebrow />
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          找不到主題：{id}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          請從列表選擇已知主題，或到{" "}
          <code className="text-cyan-200/90">src/games/slots/config</code>{" "}
          註冊新 id。
        </p>
      </div>
      <SlotsBackToListLink />
    </main>
  );
}

/** 已註冊主題但非 open（維護中或即將開放）。 */
export function SlotGameThemeUnavailableView({
  theme,
  badgeLabel,
  body,
}: {
  theme: SlotThemeConfig;
  badgeLabel: string;
  body: string;
}) {
  return (
    <main className="space-y-6">
      <div>
        <SlotsGameEyebrow />
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          {theme.headline}
        </h1>
        <p className="mt-2 inline-flex rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-100">
          {badgeLabel}
        </p>
        <p className="mt-3 max-w-2xl text-sm text-neutral-300">{body}</p>
      </div>
      <SlotsBackToListLink />
    </main>
  );
}

/** 可玩：標題列 + 轉輪 + 開發備註。 */
export function SlotGamePlayableView({ theme }: { theme: SlotThemeConfig }) {
  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <SlotsGameEyebrow />
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
            {theme.headline}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-300">
            {theme.tagline}
          </p>
          {theme.meta.status === "stub" ? (
            <p className="mt-2 text-xs font-medium text-amber-200/90">
              此主題仍為 schema 占位（stub），視覺與符號之後會替換。
            </p>
          ) : null}
        </div>
        <SlotsBackToListLink />
      </div>

      <SlotThemedPlayfield theme={theme} />

      <Card
        title="開發備註"
        description="Wallet、真實連線判定與交易紀錄將在後續 phase 接上。"
      >
        <p className="text-xs text-neutral-400">
          目前轉輪符號、paylines、paytable、betting 與主題視覺 token 皆來自{" "}
          <span className="text-cyan-200/90">SlotThemeConfig</span>（
          {theme.id}）。
        </p>
      </Card>
    </main>
  );
}
