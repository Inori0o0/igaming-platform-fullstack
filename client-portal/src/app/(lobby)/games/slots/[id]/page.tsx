import Link from "next/link";
import { Card } from "@/src/components/ui/Card";

type SlotsGamePageProps = {
  params: Promise<{ id: string }>;
};

export default async function SlotsGamePage({ params }: SlotsGamePageProps) {
  const { id } = await params;

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Slots Game
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
            老虎機：{id}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-300">
            這頁是 /games/slots/[id] 的殼。接下來會在這裡放 3x5 轉輪與下注區。
          </p>
        </div>
        <Link
          href="/games/slots"
          className="rounded-full border border-cyan-500/20 bg-neutral-950/70 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:border-cyan-400/40 hover:bg-neutral-950/90"
        >
          ← 回列表
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-cyan-500/20 bg-neutral-950/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Reels (placeholder)
            </p>
            <span className="text-[11px] text-neutral-500">
              3x5 grid + spin animation
            </span>
          </div>
          <div className="mt-4 grid aspect-5/3 grid-cols-5 gap-2 rounded-2xl border border-dashed border-cyan-500/25 bg-black/20 p-3">
            {Array.from({ length: 15 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center rounded-xl border border-cyan-500/10 bg-neutral-950/60 text-[10px] font-semibold text-neutral-500"
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card
            title="下注區（placeholder）"
            description="之後會接 wallet 餘額與 bet 金額。"
          >
            <div className="grid gap-2 text-xs text-neutral-300">
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Bet</span>
                <span className="text-cyan-200">100 Coins</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Lines</span>
                <span className="text-cyan-200">20</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Mode</span>
                <span className="text-cyan-200">Normal</span>
              </div>
              <div className="mt-2 rounded-2xl border border-cyan-500/15 bg-neutral-950/70 p-3 text-[11px] text-neutral-400">
                這裡會放「Spin / Auto / Turbo」按鈕與結果顯示。
              </div>
            </div>
          </Card>

          <Card
            title="獎勵表（placeholder）"
            description="各符號賠率之後會從 config 讀取。"
          >
            <div className="space-y-2 text-[11px] text-neutral-300">
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Wild</span>
                <span className="text-neutral-400">x ???</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Scatter</span>
                <span className="text-neutral-400">Free Spin</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
