import { Card } from "@/src/components/ui/Card";

export default function BaccaratPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Table Game
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          百家樂 Baccarat
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          目前是頁面殼。後續會做下注區（閒/莊/和）+ 發牌動畫 + 簡化路單。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-cyan-500/20 bg-neutral-950/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Table (placeholder)
            </p>
            <span className="text-[11px] text-neutral-500">player / banker</span>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-black/20 p-4 text-[11px] text-neutral-400">
              Player (閒)
            </div>
            <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-black/20 p-4 text-[11px] text-neutral-400">
              Banker (莊)
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card title="下注區（placeholder）" description="閒 / 莊 / 和">
            <div className="grid gap-2 text-[11px] text-neutral-300">
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Player</span>
                <span className="text-cyan-200">x 1.0</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Banker</span>
                <span className="text-cyan-200">x 0.95</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Tie</span>
                <span className="text-cyan-200">x 8</span>
              </div>
            </div>
          </Card>

          <Card title="路單（placeholder）" description="先做簡化版歷史結果。">
            <div className="grid grid-cols-6 gap-2 text-[10px] text-neutral-500">
              {Array.from({ length: 24 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex h-7 items-center justify-center rounded-md border border-cyan-500/10 bg-neutral-950/60"
                >
                  —
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

