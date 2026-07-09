import { Card } from "@/src/components/ui/Card";
import { GameThemeCard } from "@/src/components/ui/GameThemeCard";
import { HomeFeaturedProductCard } from "@/src/components/home/featured-product/HomeFeaturedProductCard";

export function HomeHighlightsSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Card
        title="熱門遊戲"
        description="從二十一點和百家樂進入 vAcAnt 腦爛宇宙大廳。"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              百家樂
            </p>
            <GameThemeCard
              href="/games/baccarat"
              imageSrc="/games/baccarat/bc_card_v2.webp"
              imageAlt="百家樂"
              title={"BACCARAT\n百家樂"}
              tag="百家樂"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              二十一點
            </p>
            <GameThemeCard
              href="/games/blackjack"
              imageSrc="/games/blackjack/bj_card.webp"
              imageAlt="Blackjack 二十一點"
              title={"BLACKJACK\n二十一點"}
              tag="二十一點"
            />
          </div>
        </div>
      </Card>

      <Card title="精選商品" description="用 vAcAnt VAC 解鎖服飾、數位收藏。">
        <div className="space-y-3 text-sm text-neutral-200">
          <HomeFeaturedProductCard />
        </div>
      </Card>
    </section>
  );
}
