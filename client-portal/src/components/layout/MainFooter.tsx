import Link from "next/link";

export function MainFooter() {
  return (
    <footer className="border-t border-cyan-500/10 bg-neutral-950/80 px-4 py-3 text-[11px] text-neutral-400 backdrop-blur-xl md:px-8">
      <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
        <p>© 2026 vAcAnt · Italian Brainrot Casino</p>
        <div className="flex items-center gap-3">
          <Link href="/legal#terms" className="hover:text-neutral-200">
            Terms
          </Link>
          <span className="h-3 w-px bg-neutral-700 hover:bg-neutral-200" />
          <Link href="/legal#privacy" className="hover:text-neutral-200">
            Privacy
          </Link>
          <span className="h-3 w-px bg-neutral-700 hover:bg-neutral-200" />
          <Link href="/legal#contact" className="hover:text-neutral-200">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
