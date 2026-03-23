/**
 * 動態路由 `/games/slots/[id]`：只負責依 id 解析狀態並渲染對應畫面。
 * UI 分支見同目錄 `slot-game-page-views.tsx`。
 */
import {
  getSlotComingSoonPlaceholder,
  getSlotThemeAvailability,
  getSlotThemeConfig,
  isSlotThemePlayable,
} from "@/src/games/slots/config";
import {
  SlotGameComingSoonPlaceholderView,
  SlotGamePlayableView,
  SlotGameThemeUnavailableView,
  SlotGameUnknownThemeView,
} from "./slot-game-page-views";

type SlotsGamePageProps = {
  params: Promise<{ id: string }>;
};

export default async function SlotsGamePage({ params }: SlotsGamePageProps) {
  const { id } = await params;
  const theme = getSlotThemeConfig(id);

  if (!theme) {
    const placeholder = getSlotComingSoonPlaceholder(id);
    if (placeholder) {
      return <SlotGameComingSoonPlaceholderView placeholder={placeholder} />;
    }
    return <SlotGameUnknownThemeView id={id} />;
  }

  if (!isSlotThemePlayable(theme.id)) {
    const availability = getSlotThemeAvailability(theme.id);
    const badgeLabel =
      availability === "maintenance" ? "維護中" : "即將開放";
    const body =
      availability === "maintenance"
        ? "此主題暫停服務，請稍後再試。"
        : "此主題尚未開放，敬請期待。";

    return (
      <SlotGameThemeUnavailableView
        theme={theme}
        badgeLabel={badgeLabel}
        body={body}
      />
    );
  }

  return <SlotGamePlayableView theme={theme} />;
}
