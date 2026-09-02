import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";

import { BreachCard } from "@/components/breach-card";
import { checkEmail, getRecentBreaches, type BreachReport } from "@/lib/breach.functions";
import { compactNumber, longDate } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Veritas — Have you been exposed in a data breach?" },
      {
        name: "description",
        content:
          "Enter one email address and see every public data breach it appears in — dated, itemised, with the exact data types exposed.",
      },
      { property: "og:title", content: "Veritas — Have you been exposed?" },
      {
        property: "og:description",
        content: "A calm forensic record of every public breach your email address has appeared in.",
      },
    ],
  }),
  component: Index,
});

const SENSITIVE = /password|credit|social security|government|token|financial|bank/i;
const PAGE = 3;

function Index() {
  const [email, setEmail] = useState("");
  const [visible, setVisible] = useState(PAGE);
  const runCheck = useServerFn(checkEmail);

  const scan = useMutation({
    mutationFn: (value: string) => runCheck({ data: { email: value } }),
    onSuccess: () => setVisible(PAGE),
  });

  const recent = useQuery({
    queryKey: ["recent-breaches"],
    queryFn: () => getRecentBreaches({ data: { limit: 3 } }),
    staleTime: 1000 * 60 * 30,
  });

  const report = scan.data;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (value) scan.mutate(value);
  }

  return (
    <main className="mx-auto max-w-6xl px-6">
      <section className="relative pb-16 pt-20">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
          (a) — Confidential scan
        </p>
        <h1 className="text-balance font-serif text-5xl leading-[1.05] text-cream md:text-7xl">
          <span className="inline-block animate-rise">Have you been</span>
          <br />
          <span className="inline-block animate-rise italic text-gold-2 [animation-delay:120ms]">
            exposed?
          </span>
        </h1>
        <p className="mt-6 max-w-[46ch] animate-rise text-pretty text-base leading-relaxed text-muted [animation-delay:220ms]">
          One address. A complete forensic record of every public breach your data has appeared in.
          No alarms — just the facts, dated and itemised.
        </p>

        <form onSubmit={onSubmit} className="relative mt-10 max-w-xl animate-rise [animation-delay:320ms]">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-ink-2 ring-1 ring-black/40">
            <div className="flex items-center gap-3 py-4 pl-5 pr-32">
              <span className="font-serif text-2xl text-gold">›</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address to check"
                className="flex-1 bg-transparent font-mono text-sm text-cream placeholder:text-muted/70 focus:outline-none"
                placeholder="you@domain.com"
              />
            </div>
            {scan.isPending ? (
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-beam bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            ) : null}
          </div>
          <button
            type="submit"
            disabled={scan.isPending}
            className="absolute right-0 top-0 h-full rounded-r-2xl border-l border-line bg-gold px-6 font-sans text-sm font-semibold text-ink transition-colors hover:bg-gold-2 disabled:opacity-70"
          >
            {scan.isPending ? "Scanning" : "Run scan"}
          </button>
        </form>

        <p className="mt-4 animate-rise font-mono text-[11px] text-muted [animation-delay:400ms]">
          Your address is checked live and never stored · Public breach index, updated daily
        </p>

        {scan.isError ? (
          <p className="mt-4 font-mono text-[11px] text-destructive">
            {(scan.error as Error).message}
          </p>
        ) : null}
      </section>

      {report ? <Verdict report={report} /> : null}

      {report?.found ? (
        <section className="py-16">
          <div className="mb-8 flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
              (c) — Chronology
            </p>
            <p className="font-mono text-[11px] text-muted">{report.count} records · newest first</p>
          </div>

          <div className="relative border-l border-line/70 pl-8">
            {report.breaches.slice(0, visible).map((breach, index) => (
              <BreachCard key={breach.id} breach={breach} index={index} />
            ))}

            {visible < report.count ? (
              <button
                onClick={() => setVisible((v) => v + 10)}
                className="mt-2 w-full rounded-2xl border border-dashed border-line py-4 font-mono text-[12px] uppercase tracking-wider text-muted transition-colors hover:border-gold/40 hover:text-gold-2"
              >
                View remaining {report.count - visible} records
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="border-t border-line/60 py-16">
        <div className="mb-8 flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
            (d) — Recent incidents
          </p>
          <Link to="/breaches" className="font-mono text-[11px] text-muted transition-colors hover:text-gold-2">
            Browse all →
          </Link>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line/40 sm:grid-cols-3">
          {(recent.data ?? []).map((breach) => (
            <div key={breach.id} className="bg-ink-2 p-5">
              <p className="font-mono text-[11px] text-muted">
                {longDate(breach.breachedDate, breach.year)}
              </p>
              <h4 className="mt-2 font-serif text-xl text-cream">{breach.name}</h4>
              <p className="mt-1 font-mono text-[11px] text-gold-2">
                {compactNumber(breach.records)} accounts
              </p>
            </div>
          ))}
          {recent.isPending
            ? [0, 1, 2].map((i) => (
                <div key={i} className="bg-ink-2 p-5">
                  <div className="h-3 w-20 rounded bg-ink-3" />
                  <div className="mt-3 h-5 w-32 rounded bg-ink-3" />
                  <div className="mt-3 h-3 w-24 rounded bg-ink-3" />
                </div>
              ))
            : null}
        </div>
      </section>
    </main>
  );
}

function Verdict({ report }: { report: BreachReport }) {
  if (!report.found) {
    return (
      <section className="border-y border-line/60 bg-ink-2/50 py-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">(b) — Verdict</p>
        <div className="mt-3 flex flex-wrap items-end gap-4 animate-verdict">
          <span className="font-serif text-7xl leading-none text-gold-2">0</span>
          <span className="mb-2 font-serif text-2xl italic text-cream">breaches on record</span>
        </div>
        <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted">
          <span className="font-mono text-cream">{report.email}</span> does not appear in any breach
          in the public index. Keep using unique passwords — new incidents are added constantly.
        </p>
      </section>
    );
  }

  return (
    <section className="border-y border-line/60 bg-ink-2/50 py-12">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="animate-verdict">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
            (b) — Verdict for {report.email}
          </p>
          <div className="mt-3 flex items-end gap-4">
            <span className="font-serif text-7xl leading-none text-gold-2">{report.count}</span>
            <span className="mb-2 font-serif text-2xl italic text-cream">breaches on record</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-10 animate-verdict [animation-delay:150ms]">
          <div>
            <p className="font-mono text-3xl text-cream">{report.firstYear ?? "—"}</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted">First incident</p>
          </div>
          <div>
            <p className="font-mono text-3xl text-cream">{report.lastYear ?? "—"}</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Most recent</p>
          </div>
          <div>
            <p className="font-mono text-3xl text-cream">{report.dataTypes.length}</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Data types</p>
          </div>
          <div>
            <p className="font-mono text-3xl text-cream">{report.riskLabel}</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Risk level</p>
          </div>
        </div>
      </div>

      <div className="mt-10 animate-rise [animation-delay:250ms]">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Exposed data types
        </p>
        <div className="flex flex-wrap gap-2">
          {report.dataTypes.map((type) => (
            <span
              key={type.name}
              className={
                SENSITIVE.test(type.name)
                  ? "rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs text-gold-2"
                  : "rounded-full border border-line bg-ink-3 px-3 py-1.5 text-xs text-cream"
              }
            >
              {type.name}
              <span className="ml-2 font-mono text-[10px] text-muted">×{type.count}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
