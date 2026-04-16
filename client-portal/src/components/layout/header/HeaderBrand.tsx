import Image from "next/image";
import Link from "next/link";

export function HeaderBrand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden filter-[drop-shadow(0_0_4px_rgba(255,255,255,0.45))_drop-shadow(0_0_10px_rgba(255,255,255,0.18))]">
        <Image
          src="/logo.svg"
          alt="vAcAnt"
          fill
          sizes="36px"
          className="object-contain"
          priority
        />
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
