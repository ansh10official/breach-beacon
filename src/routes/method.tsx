import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/method")({
  head: () => ({
    meta: [
      { title: "Method & privacy — how Veritas checks breaches" },
      {
        name: "description",
        content:
          "How the breach lookup works, where the data comes from, what we never store, and what to do if your address appears in an incident.",
      },
      { property: "og:title", content: "Method & privacy — Veritas" },
      {
        property: "og:description",
        content: "Sources, privacy practices and remediation steps behind the Veritas breach ledger.",
      },
    ],
  }),
  component: Method,
});

const steps = [
  {
    label: "01",
    title: "You submit an address",
    body: "The address is sent once to our server, used for a single lookup, and discarded. Nothing is written to a database, log, or analytics event.",
  },
  {
    label: "02",
    title: "We query the public index",
    body: "The lookup runs against the XposedOrNot public breach index — thousands of verified, publicly disclosed incidents, updated daily.",
  },
  {
    label: "03",
    title: "We reconstruct the record",
    body: "Each match is enriched with the breach catalogue: exact disclosure date, affected account count, industry and the categories of data exposed.",
  },
  {
    label: "04",
    title: "You act on it",
    body: "Change any password reused across a listed service, enable two-factor authentication, and treat contact-detail leaks as a phishing risk.",
  },
];

function Method() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-16">
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">(a) — Method</p>
      <h1 className="font-serif text-5xl text-cream md:text-6xl">
        How the <span className="italic text-gold-2">scan</span> works
      </h1>
      <p className="mt-5 max-w-[52ch] text-pretty leading-relaxed text-muted">
        No accounts, no tracking, no stored addresses. A single query against a public record of
        disclosed breaches, returned as evidence rather than alarm.
      </p>

      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line/40 sm:grid-cols-2">
        {steps.map((step) => (
          <section key={step.label} className="bg-ink-2 p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">{step.label}</p>
            <h2 className="mt-3 font-serif text-2xl text-cream">{step.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-2xl border border-line bg-ink-2 p-7">
        <h2 className="font-serif text-2xl text-cream">A note on completeness</h2>
        <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-muted">
          A clean result means your address is absent from the incidents currently indexed — not that
          it has never been exposed. Breaches often surface years after the fact. Re-check
          periodically, and never reuse a password across services.
        </p>
      </section>
    </main>
  );
}
