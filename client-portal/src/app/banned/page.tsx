"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";

const POSSIBLE_REASONS = [
  "違反平台服務條款或使用規範",
  "帳戶出現可疑活動或異常登入行為",
  "涉及異常或不正當的交易、下注行為",
  "同一使用者持有多個帳號（多帳號使用）",
  "未符合法定年齡限制",
];

function formatBannedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Taipei",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function BannedPage() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  const bannedAt =
    user && !user.is_guest && user.banned_at
      ? formatBannedAt(user.banned_at)
      : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#03030a] px-4 py-12">
      {/* 背景裝飾 */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.08),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(251,191,36,0.04),transparent_60%)]" />
      </div>

      <div className="w-full max-w-lg">
        {/* 警示圖示 */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-rose-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
        </div>

        {/* 主標題 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-rose-400">
            帳號已停權
          </h1>
          <p className="text-sm text-neutral-500">
            你的帳號已被平台暫停使用，無法存取任何功能。
          </p>
          {bannedAt && (
            <p className="mt-3 text-xs text-neutral-600">
              停權時間：
              <span className="font-medium text-neutral-400">{bannedAt}</span>
            </p>
          )}
        </div>

        {/* 可能原因卡片 */}
        <div className="mb-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-5 backdrop-blur-sm">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400/80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            停權可能原因
          </h2>
          <ul className="space-y-2">
            {POSSIBLE_REASONS.map((reason) => (
              <li
                key={reason}
                className="flex items-start gap-2.5 text-sm text-neutral-400"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500/60" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* 說明文字 */}
        <p className="mb-6 text-center text-xs leading-relaxed text-neutral-600">
          如果你認為這是誤判，或需要進一步了解停權原因，
          <br />
          請透過客服管道與我們聯繫。
        </p>

        {/* 操作按鈕 */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="mailto:support@vacant-igaming.com"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm font-medium text-amber-300 transition hover:border-amber-400/50 hover:bg-amber-500/15 hover:text-amber-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            聯絡客服
          </a>
          <button
            onClick={handleSignOut}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-700/60 bg-neutral-800/50 px-4 py-3 text-sm font-medium text-neutral-300 transition hover:border-neutral-600 hover:bg-neutral-700/60 hover:text-neutral-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            登出帳號
          </button>
        </div>
      </div>

      {/* 底部 branding */}
      <p className="mt-12 text-xs text-neutral-700">
        vAcAnt iGaming · 平台服務管理
      </p>
    </main>
  );
}
