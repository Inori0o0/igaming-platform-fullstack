import Image from "next/image";
import { HomeHeroSection } from "@/src/components/home/HomeHeroSection";
import { HomeHighlightsSection } from "@/src/components/home/HomeHighlightsSection";

export default function Home() {
  return (
    <main className="space-y-10">
      <div className="relative isolate overflow-hidden rounded-3xl p-4 sm:p-6">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <Image
            src="/home/home_hero.webp"
            alt=""
            fill
            priority
            fetchPriority="high"
            className="object-cover object-center opacity-70"
            sizes="(max-width: 768px) 100vw, 1920px"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/25 via-black/40 to-black/88" />
        </div>
        <HomeHeroSection />
      </div>
      <HomeHighlightsSection />
    </main>
  );
}
