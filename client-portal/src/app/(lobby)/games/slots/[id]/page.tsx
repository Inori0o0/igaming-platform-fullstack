/**
 * 動態路由 `/games/slots/[id]`：統一回傳同一種老虎機畫面。
 */
import Link from "next/link";
import {
  getSlotThemeConfig,
  SLOT_THEME_IDS,
  type SlotThemeConfig,
} from "@/src/games/slots/config";
import { SlotThemedPlayfield } from "@/src/games/slots/components/SlotThemedPlayfield";

type SlotsGamePageProps = {
  params: Promise<{ id: string }>;
};

export default async function SlotsGamePage({ params }: SlotsGamePageProps) {
  const { id } = await params;
  const fallbackThemeId = SLOT_THEME_IDS[0];
  const theme = getSlotThemeConfig(id) ?? getSlotThemeConfig(fallbackThemeId);

  if (!theme) return null;

  return <SlotGamePlayableView theme={theme} />;
}

function SlotGamePlayableView({ theme }: { theme: SlotThemeConfig }) {
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
        </div>
        <Link
          href="/games/slots"
          className="inline-flex rounded-full border border-cyan-500/20 bg-neutral-950/70 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:border-cyan-400/40 hover:bg-neutral-950/90"
        >
          ← 回列表
        </Link>
      </div>

      <SlotThemedPlayfield theme={theme} />
    </main>
  );
}
