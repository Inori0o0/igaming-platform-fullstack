"use client";

import { startTransition, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { lobbySidebarSections } from "@/src/components/layout/navConfig";
import { SidebarSection } from "@/src/components/layout/sidebar/SidebarSection";
import { cn } from "@/src/lib/cn";

/** 與 MainSidebar 同源（lobbySidebarSections）；portal 疊在 header 上，關閉時還原 body overflow。 */
export function MobileNavDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setOpen(false);
    });
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={cn(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/25 bg-neutral-900/80 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-colors hover:border-cyan-400/40 hover:bg-neutral-800/90 md:hidden",
        )}
        aria-expanded={open}
        aria-controls="mobile-lobby-nav"
        aria-label="開啟導覽選單"
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">開啟選單</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="md:hidden">
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm"
              aria-label="關閉選單"
              onClick={() => setOpen(false)}
            />
            <aside
              id="mobile-lobby-nav"
              className="fixed left-0 top-0 z-50 flex h-full w-[min(100%,20rem)] flex-col border-r border-cyan-500/15 bg-neutral-950/95 pb-6 pt-4 shadow-[0_0_80px_rgba(15,23,42,0.95)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-2 border-b border-cyan-500/10 px-4 pb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                  vAcAnt Lobby
                </span>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
                  aria-label="關閉導覽選單"
                  onClick={() => setOpen(false)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 pt-4 text-sm text-neutral-300">
                {lobbySidebarSections.map((section) => (
                  <SidebarSection
                    key={section.title}
                    title={section.title}
                    items={section.items}
                    pathname={pathname}
                  />
                ))}
              </nav>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
