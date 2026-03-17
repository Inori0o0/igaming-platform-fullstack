"use client";

import Image from "next/image";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { useAuthStore } from "@/src/store/authStore";

export default function Home() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const setOpenAuthModal = useAuthStore((s) => s.setOpenAuthModal);

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-cyan-300/90">載入中…</p>
      </main>
    );
  }

  return (
    <main className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-300/80">
            vAcAnt · Italian Brainrot Casino
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl">
            連線，走進霓虹腦爛賭場宇宙。
          </h1>
          <p className="max-w-xl text-sm text-neutral-300 sm:text-base">
            管理你的虛擬錢包、遊玩 Slots、Blackjack、Baccarat 與 Lottery，
            並在 vAcAnt 商店解鎖收藏與限定造型。
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => setOpenAuthModal(true)}>
              開始連線／登入
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setOpenAuthModal(true)}
            >
              以訪客進入大廳
            </Button>
          </div>
          <p className="text-[11px] text-neutral-500">
            ※ Italian Brainrot 角色插畫：之後會在此區塊左側或背景加入主視覺。
          </p>
        </div>

        <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-cyan-500/40 bg-neutral-950/80 shadow-[0_0_60px_rgba(34,211,238,0.45)]">
          <Image
            src="/horse-hero.png"
            alt="vAcAnt Brainrot Hero"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 480px, 100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-200/90">
              vAcAnt Lobby Hero
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              這裡之後會換成 Italian Brainrot 主視覺插畫。
            </p>
          </div>
        </div>
      </section>

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
              <p className="mt-1 text-sm font-medium">
                Blackjack &amp; Baccarat
              </p>
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

      <section className="rounded-2xl border border-dashed border-cyan-500/30 bg-neutral-950/70 p-4 text-[11px] text-neutral-300">
        Italian Brainrot 圖像提示區：
        之後可在首頁 Hero、熱門遊戲卡片與 Sidebar「Brainrot Corner」中放入對應角色插畫。
      </section>
    </main>
  );
}
