"use client";

import { HomeHeroSection } from "@/src/components/home/HomeHeroSection";
import { HomeHighlightsSection } from "@/src/components/home/HomeHighlightsSection";
import { HomeBrainrotHintSection } from "@/src/components/home/HomeBrainrotHintSection";
import { useAuthStore } from "@/src/store/authStore";

export default function Home() {
  const setOpenAuthModal = useAuthStore((s) => s.setOpenAuthModal);

  return (
    <main className="space-y-10">
      <HomeHeroSection onOpenAuthModal={() => setOpenAuthModal(true)} />
      <HomeHighlightsSection />
      <HomeBrainrotHintSection />
    </main>
  );
}
