export function MainFooter() {
  return (
    <footer className="border-t border-cyan-500/10 bg-neutral-950/80 px-4 py-3 text-[11px] text-neutral-400 backdrop-blur-xl md:px-8">
      <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
        <p>
          © {new Date().getFullYear()} vAcAnt · Virtual iGaming Portfolio
        </p>
        <div className="flex items-center gap-3">
          <span className="hover:text-neutral-200">Terms</span>
          <span className="h-3 w-px bg-neutral-700" />
          <span className="hover:text-neutral-200">Privacy</span>
          <span className="h-3 w-px bg-neutral-700" />
          <span className="hover:text-neutral-200">Contact</span>
        </div>
      </div>
    </footer>
  );
}

