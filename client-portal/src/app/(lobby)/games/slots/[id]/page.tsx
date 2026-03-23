/**
 * 動態路由 `/games/slots/[id]`：有註冊主題且可玩 → 渲染 SlotThemedPlayfield；
 * 僅圖卡／placeholder → 即將開放頁；有主題但非 open → 維護或即將開放說明；否則 404 提示。
 */
import Link from "next/link";
import { Card } from "@/src/components/ui/Card";
import { SlotThemedPlayfield } from "@/src/games/slots/components/SlotThemedPlayfield";
import {
  getSlotComingSoonPlaceholder,
  getSlotThemeAvailability,
  getSlotThemeConfig,
  isSlotThemePlayable,
} from "@/src/games/slots/config";

type SlotsGamePageProps = {
  params: Promise<{ id: string }>;
};

export default async function SlotsGamePage({ params }: SlotsGamePageProps) {
  const { id } = await params;
  const theme = getSlotThemeConfig(id);
  const comingSoonOnly = !theme ? getSlotComingSoonPlaceholder(id) : undefined;

  if (!theme) {
    if (comingSoonOnly) {
      return (
        <main className="space-y-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Slots Game
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
              {comingSoonOnly.headline}
            </h1>
            <p className="mt-2 inline-flex rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-100">
              即將開放
            </p>
            <p className="mt-3 max-w-2xl text-sm text-neutral-300">
              {comingSoonOnly.tagline ?? "此主題尚未開放，敬請期待。"}
            </p>
          </div>
          <Link
            href="/games/slots"
            className="inline-flex rounded-full border border-cyan-500/20 bg-neutral-950/70 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:border-cyan-400/40 hover:bg-neutral-950/90"
          >
            ← 回列表
          </Link>
        </main>
      );
    }

    return (
      <main className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Slots Game
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
            找不到主題：{id}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-300">
            請從列表選擇已知主題，或到{" "}
            <code className="text-cyan-200/90">src/games/slots/config</code>{" "}
            註冊新 id。
          </p>
        </div>
        <Link
          href="/games/slots"
          className="inline-flex rounded-full border border-cyan-500/20 bg-neutral-950/70 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:border-cyan-400/40 hover:bg-neutral-950/90"
        >
          ← 回列表
        </Link>
      </main>
    );
  }

  const availability = getSlotThemeAvailability(theme.id);
  if (!isSlotThemePlayable(theme.id)) {
    const headline =
      availability === "maintenance" ? "維護中" : "即將開放";
    const body =
      availability === "maintenance"
        ? "此主題暫停服務，請稍後再試。"
        : "此主題尚未開放，敬請期待。";

    return (
      <main className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Slots Game
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
            {theme.headline}
          </h1>
          <p className="mt-2 inline-flex rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-100">
            {headline}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-neutral-300">{body}</p>
        </div>
        <Link
          href="/games/slots"
          className="inline-flex rounded-full border border-cyan-500/20 bg-neutral-950/70 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:border-cyan-400/40 hover:bg-neutral-950/90"
        >
          ← 回列表
        </Link>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Slots Game
          </p>
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
        <Link
          href="/games/slots"
          className="rounded-full border border-cyan-500/20 bg-neutral-950/70 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:border-cyan-400/40 hover:bg-neutral-950/90"
        >
          ← 回列表
        </Link>
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
