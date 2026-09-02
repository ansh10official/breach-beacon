import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/60 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-gold/40">
            <span className="font-serif text-lg text-gold">V</span>
            <span className="absolute inset-y-0 -left-1 w-8 animate-scan bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          </div>
          <div className="leading-tight">
            <span className="font-serif text-xl text-cream">Veritas</span>
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Breach Ledger
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <Link to="/method" className="transition-colors hover:text-cream" activeProps={{ className: "text-gold-2" }}>
            Method
          </Link>
          <Link
            to="/breaches"
            className="transition-colors hover:text-cream"
            activeProps={{ className: "text-gold-2" }}
          >
            Coverage
          </Link>
          <Link to="/" className="transition-colors hover:text-cream" activeOptions={{ exact: true }} activeProps={{ className: "text-gold-2" }}>
            Check
          </Link>
        </nav>
        <span className="font-mono text-[11px] text-muted">v3.1</span>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line/60 bg-ink-2/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full border border-gold/40 font-serif text-lg text-gold">
            V
          </div>
          <span className="font-serif text-lg text-cream">Veritas</span>
          <span className="font-mono text-[11px] text-muted">· The calm record of every leak</span>
        </div>
        <div className="flex gap-6 text-xs text-muted">
          <Link to="/method" className="transition-colors hover:text-cream">
            Sources
          </Link>
          <Link to="/method" className="transition-colors hover:text-cream">
            Privacy
          </Link>
          <a
            href="https://xposedornot.com/api_doc"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-cream"
          >
            API
          </a>
        </div>
      </div>
    </footer>
  );
}
