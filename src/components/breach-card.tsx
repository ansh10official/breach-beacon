import type { BreachRecord } from "@/lib/breach.functions";
import { compactNumber, initial, longDate } from "@/lib/format";

const SENSITIVE = /password|credit|social security|government|token|financial|bank/i;

export function BreachCard({ breach, index }: { breach: BreachRecord; index: number }) {
  return (
    <article className="relative mb-6 animate-rise" style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }}>
      <span
        className={`absolute -left-[37px] top-6 h-3 w-3 rounded-full bg-ink ${
          index === 0 ? "border-2 border-gold" : "border-2 border-line"
        }`}
      />
      <div className="rounded-2xl border border-line bg-ink-2 p-6 ring-1 ring-black/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {breach.logo ? (
              <img
                src={breach.logo}
                alt={`${breach.name} logo`}
                loading="lazy"
                className="size-12 rounded-xl bg-ink-3 object-contain p-1.5"
              />
            ) : (
              <div className="grid size-12 place-items-center rounded-xl bg-ink-3 font-serif text-2xl text-gold">
                {initial(breach.name)}
              </div>
            )}
            <div>
              <h3 className="font-serif text-2xl text-cream">{breach.name}</h3>
              <p className="font-mono text-[11px] text-muted">
                Breached {longDate(breach.breachedDate, breach.year || "date unknown")}
                {breach.domain ? ` · ${breach.domain}` : ""}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg text-cream">{compactNumber(breach.records)}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Accounts</p>
          </div>
        </div>

        {breach.description ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">{breach.description}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {breach.dataTypes.map((type) => (
            <span
              key={type}
              className={
                SENSITIVE.test(type)
                  ? "rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] text-gold-2"
                  : "rounded-md border border-line bg-ink-3 px-2.5 py-1 text-[11px] text-cream"
              }
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
