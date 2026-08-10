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

/** Prefer the longest matching href so `/profile/history` does not also activate `/profile`. */
function isItemActive(pathname: string, href: string, items: SidebarItem[]) {
  if (href === "/") return pathname === "/";
  if (!pathname.startsWith(href)) return false;
  const hasMoreSpecificMatch = items.some(
    (other) =>
      other.href !== href &&
      other.href.startsWith(`${href}/`) &&
      pathname.startsWith(other.href),
  );
  return !hasMoreSpecificMatch;
}

/** active：`/` 只比對相等；其餘取最長匹配，避免父子路徑同時亮起。 */
export function SidebarSection({ title, items, pathname }: SidebarSectionProps) {
  return (
    <div className="space-y-2">
      <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {title}
      </p>
      <div className="space-y-1">
        {items.map((item) => {
          const active = isItemActive(pathname, item.href, items);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex min-h-9 items-center rounded-xl px-3 py-2 pr-5 text-xs transition-colors ${
                active
                  ? "bg-cyan-500/15 text-cyan-100"
                  : "text-neutral-400 hover:bg-neutral-900/70 hover:text-neutral-50"
              }`}
            >
              <span className="relative z-10">{item.label}</span>
              {/* Absolute indicator: never participates in flex layout / height. */}
              <span
                aria-hidden
                className={`pointer-events-none absolute right-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-linear-to-b from-cyan-400 via-emerald-300 to-cyan-400 ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
