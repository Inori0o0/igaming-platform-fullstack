import { GameLoadingScreen } from "@/src/components/loading/GameLoadingScreen";

export default function SlotThemeLoading() {
  return (
    <GameLoadingScreen
      gameName="Slots"
      tip="正在載入機台與主題資源..."
    />
  );
}
