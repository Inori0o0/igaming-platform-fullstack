"use client";

/**
 * 首頁「熱門遊戲」區：左欄 Italian Brainrot Slots，右欄二十一點圖卡。
 */
import { Card } from "@/src/components/ui/Card";
import { GameThemeCard } from "@/src/components/ui/GameThemeCard";

export function HomeHighlightsSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Card
        title="熱門遊戲"
        description="從老虎機、二十一點到百家樂，進入 vAcAnt 腦爛宇宙大廳。"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Slots
            </p>
            <GameThemeCard
              href="/games/slots/italian-brainrot"
              imageSrc="/games/slots/italian-brainrot/ib_card.png"
              imageAlt="Italian Brainrot Slots"
              title="ITALIAN BRAINROT"
              tag="Slots"
            />
            <p className="px-1 text-[11px] text-neutral-400">
              Tralalero、Bombardiro、Lirilì 等角色主題；點擊進入遊戲。
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              二十一點
            </p>
            <GameThemeCard
              href="/games/blackjack"
              imageSrc="/games/blackjack/bj_card.png"
              imageAlt="Blackjack 二十一點"
              title="BLACKJACK 二十一點"
              tag="二十一點"
            />
            <p className="px-1 text-[11px] text-neutral-400">
              Tung Tung Tung Sahur 莊家、過五關與標準玩法；點擊進入遊戲。
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
