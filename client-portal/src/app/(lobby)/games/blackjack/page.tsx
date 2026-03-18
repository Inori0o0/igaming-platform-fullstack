import { Card } from "@/src/components/ui/Card";

export default function BlackjackPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Table Game
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          二十一點 Blackjack
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          目前是頁面殼。後續會做發牌動畫、下注區、要牌/停牌/雙倍/分牌。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-cyan-500/20 bg-neutral-950/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Table (placeholder)
            </p>
            <span className="text-[11px] text-neutral-500">
              dealer + player hands
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-black/20 p-4 text-[11px] text-neutral-400">
              Dealer hand
            </div>
            <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-black/20 p-4 text-[11px] text-neutral-400">
              Player hand
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card title="操作區（placeholder）" description="之後會接上狀態與按鈕。">
            <div className="grid gap-2 text-[11px] text-neutral-300">
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Bet</span>
                <span className="text-cyan-200">200 Coins</span>
              </div>
              <div className="rounded-2xl border border-cyan-500/15 bg-neutral-950/70 p-3 text-neutral-400">
                Hit / Stand / Double / Split
              </div>
            </div>
          </Card>

          <Card title="角色演出（placeholder）" description="Italian Brainrot 設定對應。">
            <ul className="list-disc space-y-1 pl-5 text-[11px] text-neutral-300">
              <li>莊家：Lirili Larila</li>
              <li>提示員：Brr Brr Patapim</li>
              <li>高額局面：Bombardiro Crocodilo</li>
            </ul>
          </Card>
        </div>
      </div>
    </main>
  );
}

