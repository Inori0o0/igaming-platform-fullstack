"use client";

import { Card } from "@/src/components/ui/Card";

export function HomeHighlightsSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Card
        title="熱門遊戲"
        description="從老虎機、二十一點到百家樂，進入 vAcAnt 腦爛宇宙大廳。"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-cyan-500/30 bg-neutral-950/80 p-3 text-sm text-neutral-200">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Slots
            </p>
            <p className="mt-1 text-sm font-medium">Italian Brainrot Slots</p>
            <p className="mt-1 text-[11px] text-neutral-400">
              這裡之後放 Brainrot Slots 主題插畫卡片圖。
            </p>
          </div>
          <div className="rounded-xl border border-purple-400/30 bg-neutral-950/80 p-3 text-sm text-neutral-200">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">
              Table Games
            </p>
            <p className="mt-1 text-sm font-medium">Blackjack &amp; Baccarat</p>
            <p className="mt-1 text-[11px] text-neutral-400">
              之後在此放腦爛牌桌場景圖（Lirili Larila 等角色）。
            </p>
          </div>
        </div>
      </Card>

      <Card
        title="精選商品"
        description="用 vAcAnt Coins 解鎖服飾、數位收藏與 VIP 資格。"
      >
        <div className="space-y-3 text-sm text-neutral-200">
          <div className="flex items-center justify-between rounded-xl bg-neutral-950/80 px-3 py-2">
            <span>Neon Horse Hoodie</span>
            <span className="text-xs text-cyan-300">8,800 Coins</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-neutral-950/80 px-3 py-2">
            <span>Italian Brainrot Avatar Pack</span>
            <span className="text-xs text-cyan-300">3,200 Coins</span>
          </div>
          <p className="text-[11px] text-neutral-500">
            之後會接上真實商品資料與圖片，這裡暫時為版位展示。
          </p>
        </div>
      </Card>
    </section>
  );
}

