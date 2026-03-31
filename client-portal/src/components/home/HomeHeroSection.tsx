"use client";

import Image from "next/image";
import { Button } from "@/src/components/ui/Button";
import { HomeClaimFreeCoinsOverlay } from "@/src/components/home/HomeClaimFreeCoinsOverlay";
import { useAuthStore } from "@/src/store/authStore";

type HomeHeroSectionProps = {
  onOpenAuthModal: () => void;
};

export function HomeHeroSection({ onOpenAuthModal }: HomeHeroSectionProps) {
  const user = useAuthStore((s) => s.user);

  const showAuthButtons = !user || user.is_guest;

  return (
    <section className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-300/80">
          vAcAnt · Italian Brainrot Casino
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl">
          連線，走進霓虹腦爛賭場宇宙。
        </h1>
        <p className="max-w-xl text-sm text-neutral-300 sm:text-base">
          管理你的虛擬錢包、遊玩 Slots、Blackjack、Baccarat 與 Lottery， 並在
          vAcAnt 商店解鎖收藏與限定商品。
        </p>
        {showAuthButtons && (
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={onOpenAuthModal}>
              開始連線／登入
            </Button>
            {user?.is_guest && (
              <Button size="lg" variant="outline" onClick={onOpenAuthModal}>
                以訪客進入大廳
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-cyan-500/40 bg-neutral-950/80 shadow-[0_0_60px_rgba(34,211,238,0.45)]">
          <Image
            src="/home/point_down.png"
            alt="vAcAnt Brainrot Hero"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 480px, 100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
        </div>

        <HomeClaimFreeCoinsOverlay />
      </div>
    </section>
  );
}
