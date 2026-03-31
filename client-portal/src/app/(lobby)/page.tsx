"use client";

import Image from "next/image";
import { HomeHeroSection } from "@/src/components/home/HomeHeroSection";
import { HomeHighlightsSection } from "@/src/components/home/HomeHighlightsSection";
import { useAuthStore } from "@/src/store/authStore";

export default function Home() {
  const setOpenAuthModal = useAuthStore((s) => s.setOpenAuthModal);

  return (
    <main className="space-y-10">
      <div className="relative isolate overflow-hidden rounded-3xl p-4 sm:p-6">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <Image
            src="/home/home_hero.png"
            alt=""
            fill
            priority
            className="object-cover object-center opacity-70"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/25 via-black/40 to-black/88" />
        </div>
        <HomeHeroSection onOpenAuthModal={() => setOpenAuthModal(true)} />
      </div>
      <HomeHighlightsSection />
    </main>
  );
}
