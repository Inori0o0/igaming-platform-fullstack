import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

type ProfileGuestGateProps = {
  title: string;
  description: string;
  message: string;
  onLogin?: () => void;
  loginLabel?: string;
  /** row：訊息與按鈕左右並排（profile 總覽頁樣式）；block：置中文字塊（其餘子頁樣式）。 */
  layout?: "row" | "block";
};

/**
 * Profile 各子頁攔截「未登入／訪客模式」的共用 UI，取代原本各頁各自複製的一份 JSX。
 */
export function ProfileGuestGate({
  title,
  description,
  message,
  onLogin,
  loginLabel = "立即登入",
  layout = "block",
}: ProfileGuestGateProps) {
  return (
    <main className="space-y-4">
      <Card title={title} description={description}>
        {layout === "row" ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-300">{message}</p>
            {onLogin ? <Button onClick={onLogin}>{loginLabel}</Button> : null}
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-6 text-center text-sm text-neutral-400">
            <p>{message}</p>
            {onLogin ? (
              <Button variant="secondary" onClick={onLogin}>
                {loginLabel}
              </Button>
            ) : null}
          </div>
        )}
      </Card>
    </main>
  );
}
