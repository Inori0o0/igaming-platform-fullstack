"use client";

/**
 * 首頁「熱門遊戲」區：左欄百家樂，右欄二十一點圖卡。
 */
import { Card } from "@/src/components/ui/Card";
import { GameThemeCard } from "@/src/components/ui/GameThemeCard";
import { useFeaturedHomeProduct } from "@/src/components/home/useFeaturedHomeProduct";
import { LoadingImage } from "@/src/components/loading/LoadingImage";
import { productCategoryLabels } from "@/src/shop/types";
import Link from "next/link";

export function HomeHighlightsSection() {
  const featuredProduct = useFeaturedHomeProduct();

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Card
        title="熱門遊戲"
        description="從二十一點和百家樂進入 vAcAnt 腦爛宇宙大廳。"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              百家樂
            </p>
            <GameThemeCard
              href="/games/baccarat"
              imageSrc="/games/baccarat/bc_card_v2.png"
              imageAlt="百家樂"
              title="BACCARAT 百家樂"
              tag="百家樂"
            />
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
          </div>
        </div>
      </Card>

      <Card title="精選商品" description="用 vAcAnt VAC 解鎖服飾、數位收藏。">
        <div className="space-y-3 text-sm text-neutral-200">
          <Link
            href={`/shop/${featuredProduct.id}`}
            className="group block overflow-hidden rounded-2xl border border-cyan-500/20 bg-neutral-950/80 transition hover:border-cyan-400/40"
          >
            <div className="relative aspect-square w-full">
              <LoadingImage
                src={featuredProduct.imageSrc}
                alt={featuredProduct.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <div className="space-y-3 px-3.5 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-50">
                    {featuredProduct.name}
                  </p>
                  {featuredProduct.category ? (
                    <p className="mt-1 text-[11px] text-neutral-400">
                      {productCategoryLabels[featuredProduct.category]}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-cyan-100">
                  {featuredProduct.priceVac.toLocaleString()} VAC
                </span>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </section>
  );
}
