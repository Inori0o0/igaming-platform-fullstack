import Link from "next/link";

export function HeaderBrand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.9),rgba(56,189,248,0.2))] shadow-[0_0_24px_rgba(34,211,238,0.9)]">
        <span className="text-xs font-black tracking-[0.16em] text-neutral-950">
          vA
        </span>
      </div>
      <div className="hidden flex-col leading-tight sm:flex">
        <span className="text-xs font-semibold tracking-[0.22em] text-cyan-300/80">
          vAcAnt
        </span>
        <span className="text-[10px] text-neutral-400">
          Online Betting Universe
        </span>
      </div>
    </Link>
  );
}
