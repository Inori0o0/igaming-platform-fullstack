import { GameLoadingScreen } from "@/src/components/loading/GameLoadingScreen";

export default function BlackjackLoading() {
  return (
    <GameLoadingScreen
      gameName="Blackjack"
      tip="正在準備牌桌與發牌流程..."
    />
  );
}
