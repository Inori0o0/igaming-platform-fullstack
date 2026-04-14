"use client";

// 僅 lg+ 顯示；768–1023 有頂欄五連結但無左欄，手機則靠 MainHeader 內抽屜。
import { usePathname } from "next/navigation";
import { lobbySidebarSections } from "@/src/components/layout/navConfig";
import { SidebarSection } from "./sidebar/SidebarSection";

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-none border-r border-cyan-500/15 bg-neutral-950/90 pb-6 pt-4 shadow-[0_0_80px_rgba(15,23,42,0.9)] backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col gap-6 px-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          vAcAnt Lobby
        </div>
        <nav className="space-y-5 text-sm text-neutral-300">
          {lobbySidebarSections.map((section) => (
            <SidebarSection
              key={section.title}
              title={section.title}
              items={section.items}
              pathname={pathname}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

