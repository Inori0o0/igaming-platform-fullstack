"use client";

import { SplashScreen } from "@/src/components/loading/SplashScreen";

type HomeSplashGateProps = {
  show: boolean;
};

export function HomeSplashGate({ show }: HomeSplashGateProps) {
  return <SplashScreen show={show} mode="fullscreen" minVisibleMs={600} />;
}

