import { GameLoadingScreen } from "@/src/components/loading/GameLoadingScreen";

export default function BaccaratLoading() {
  return (
    <GameLoadingScreen
      gameName="Baccarat"
      tip="正在準備牌桌與下注區..."
    />
  );
}
