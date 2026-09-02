import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getRecentBreaches } from "@/lib/breach.functions";
import { compactNumber, initial, longDate } from "@/lib/format";

const catalogQuery = queryOptions({
  queryKey: ["breach-catalog"],
  queryFn: () => getRecentBreaches({ data: { limit: 120 } }),
  staleTime: 1000 * 60 * 30,
});

export const Route = createFileRoute("/breaches")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({
    meta: [
      { title: "Breach coverage — every indexed incident | Veritas" },
      {
        name: "description",
        content:
          "Browse the most recent publicly disclosed data breaches: company, date, accounts affected and the data types exposed.",
      },
      { property: "og:title", content: "Breach coverage — Veritas" },
      {
        property: "og:description",
        content: "The chronological record of recently disclosed data breaches.",
      },
    ],
  }),
  component: Coverage,
});

function Coverage() {
  const { data } = useSuspenseQuery(catalogQuery);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.domain.toLowerCase().includes(q) ||
        b.industry.toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-16">
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
        (a) — Coverage
      </p>
      <h1 className="font-serif text-5xl text-cream md:text-6xl">
        The <span className="italic text-gold-2">ledger</span>
      </h1>
      <p className="mt-5 max-w-[52ch] text-pretty leading-relaxed text-muted">
        The most recently disclosed incidents in the public index — who was breached, when, and what
        left the building.
      </p>

      <div className="mt-8 max-w-md overflow-hidden rounded-2xl border border-line bg-ink-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter incidents"
          placeholder="Filter by company, domain or industry"
          className="w-full bg-transparent px-5 py-4 font-mono text-sm text-cream placeholder:text-muted/70 focus:outline-none"
        />
      </div>

      <p className="mt-4 font-mono text-[11px] text-muted">{filtered.length} incidents listed</p>

      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line/40 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((breach) => (
          <article key={breach.id} className="bg-ink-2 p-5">
            <div className="flex items-center gap-3">
              {breach.logo ? (
                <img
                  src={breach.logo}
                  alt={`${breach.name} logo`}
                  loading="lazy"
                  className="size-10 rounded-lg bg-ink-3 object-contain p-1"
                />
              ) : (
                <div className="grid size-10 place-items-center rounded-lg bg-ink-3 font-serif text-lg text-gold">
                  {initial(breach.name)}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="truncate font-serif text-xl text-cream">{breach.name}</h2>
                <p className="font-mono text-[11px] text-muted">
                  {longDate(breach.breachedDate, breach.year)}
                </p>
              </div>
            </div>
            <p className="mt-3 font-mono text-[11px] text-gold-2">
              {compactNumber(breach.records)} accounts · {breach.industry || "unclassified"}
            </p>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
              {breach.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {breach.dataTypes.slice(0, 4).map((type) => (
                <span
                  key={type}
                  className="rounded-md border border-line bg-ink-3 px-2 py-0.5 text-[10px] text-cream"
                >
                  {type}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
