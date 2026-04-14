import Link from "next/link";
import { usePathname } from "next/navigation";
import { headerNavItems } from "@/src/components/layout/navConfig";

/** 僅 md 以上顯示；更窄時請用 MobileNavDrawer（左欄完整連結）。 */
export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-2 text-sm font-medium text-neutral-300 md:flex">
      {headerNavItems.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative rounded-full px-3 py-1 transition-colors ${
              active
                ? "bg-cyan-500/20 text-cyan-100"
                : "text-neutral-400 hover:bg-neutral-800/70 hover:text-neutral-50"
            }`}
          >
            {active && (
              <span className="absolute inset-x-2 -bottom-1 h-px bg-linear-to-r from-cyan-400 via-emerald-300 to-cyan-400 opacity-80" />
            )}
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

