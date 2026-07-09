import { Card } from "@/src/components/ui/Card";
import { LogoLoader } from "@/src/components/loading/LogoLoader";

type ProfileLoadingCardProps = {
  title: string;
  description: string;
  /** profile 總覽頁沿用較早的虛線/青色樣式，其餘子頁統一用實線灰邊樣式。 */
  variant?: "dashed" | "solid";
};

/**
 * Profile 分頁共用的「auth/資料載入中」骨架卡片，取代原本各頁各自複製的一份 JSX。
 */
export function ProfileLoadingCard({
  title,
  description,
  variant = "solid",
}: ProfileLoadingCardProps) {
  const borderClass =
    variant === "dashed" ? "border-dashed border-cyan-500/25" : "border-neutral-800/80";
  const paddingClass = variant === "dashed" ? "p-6" : "p-8";

  return (
    <main className="space-y-4">
      <Card title={title} description={description}>
        <div
          className={`flex min-h-28 items-center justify-center rounded-2xl border ${borderClass} bg-neutral-950/60 ${paddingClass}`}
        >
          <LogoLoader size="md" className="text-cyan-300" />
        </div>
      </Card>
    </main>
  );
}
