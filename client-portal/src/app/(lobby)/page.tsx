"use client";

import { HomeSplashGate } from "@/src/components/home/HomeSplashGate";
import { HomeHeroSection } from "@/src/components/home/HomeHeroSection";
import { HomeHighlightsSection } from "@/src/components/home/HomeHighlightsSection";
import { HomeBrainrotHintSection } from "@/src/components/home/HomeBrainrotHintSection";
import { useAuthStore } from "@/src/store/authStore";

export default function Home() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const setOpenAuthModal = useAuthStore((s) => s.setOpenAuthModal);

  return (
    <main className="space-y-10">
      <HomeSplashGate show={isLoading} />
      <HomeHeroSection onOpenAuthModal={() => setOpenAuthModal(true)} />
      <HomeHighlightsSection />
      <HomeBrainrotHintSection />
    </main>
  );
}
