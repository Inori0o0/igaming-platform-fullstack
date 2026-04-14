import Link from "next/link";

export type SidebarItem = {
  href: string;
  label: string;
};

type SidebarSectionProps = {
  title: string;
  items: SidebarItem[];
  pathname: string;
};

/** active：`/` 只比對相等；其餘 href 用 pathname.startsWith（子路徑也算同一區）。 */
export function SidebarSection({ title, items, pathname }: SidebarSectionProps) {
  return (
    <div className="space-y-2">
      <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {title}
      </p>
      <div className="space-y-1">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                active
                  ? "bg-cyan-500/15 text-cyan-100"
                  : "text-neutral-400 hover:bg-neutral-900/70 hover:text-neutral-50"
              }`}
            >
              <span className="relative z-10">{item.label}</span>
              {active && (
                <span className="h-7 w-[3px] rounded-full bg-linear-to-b from-cyan-400 via-emerald-300 to-cyan-400" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

