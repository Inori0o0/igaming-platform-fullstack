import Link from "next/link";

const tabs = [
  { href: "/profile", label: "總覽" },
  { href: "/profile/history", label: "遊戲歷史" },
  { href: "/profile/orders", label: "訂單歷史" },
  { href: "/profile/achievements", label: "成就" },
] as const;

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Profile
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          個人中心
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-full border border-cyan-500/20 bg-neutral-950/70 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition hover:border-cyan-400/40 hover:bg-neutral-950/90"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
