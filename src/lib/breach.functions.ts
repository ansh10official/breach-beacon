import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API = "https://api.xposedornot.com/v1";

export type BreachRecord = {
  id: string;
  name: string;
  domain: string;
  industry: string;
  logo: string;
  description: string;
  dataTypes: string[];
  records: number;
  year: string;
  breachedDate: string | null;
  addedDate: string | null;
  passwordRisk: string;
  verified: boolean;
  reference: string;
};

export type BreachReport = {
  email: string;
  found: boolean;
  count: number;
  firstYear: string | null;
  lastYear: string | null;
  totalRecords: number;
  dataTypes: { name: string; count: number }[];
  riskLabel: string;
  riskScore: number;
  pastes: number;
  breaches: BreachRecord[];
};

type CatalogEntry = {
  breachID: string;
  breachedDate?: string;
  addedDate?: string;
  domain?: string;
  industry?: string;
  logo?: string;
  exposedData?: string[];
  exposedRecords?: number;
  exposureDescription?: string;
  passwordRisk?: string;
  verified?: boolean;
  referenceURL?: string;
};

const clean = (value: string) => value.trim().replace(/^ail addresses$/i, "Email addresses");

async function fetchCatalog(): Promise<Map<string, CatalogEntry>> {
  const map = new Map<string, CatalogEntry>();
  try {
    const res = await fetch(`${API}/breaches`, { headers: { accept: "application/json" } });
    if (!res.ok) return map;
    const json = (await res.json()) as { exposedBreaches?: CatalogEntry[] };
    for (const entry of json.exposedBreaches ?? []) map.set(entry.breachID, entry);
  } catch {
    // catalog is an enrichment source only
  }
  return map;
}

function toYear(value?: string | null) {
  if (!value) return null;
  const year = new Date(value).getFullYear();
  return Number.isNaN(year) ? null : String(year);
}

export const checkEmail = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ email: z.string().email().max(254) }).parse(data))
  .handler(async ({ data }): Promise<BreachReport> => {
    const email = data.email.trim().toLowerCase();

    const res = await fetch(`${API}/breach-analytics?email=${encodeURIComponent(email)}`, {
      headers: { accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error("The breach index is unreachable right now. Try again in a moment.");
    }

    const json = (await res.json()) as {
      ExposedBreaches?: { breaches_details?: Record<string, unknown>[] } | null;
      BreachMetrics?: {
        risk?: { risk_label?: string; risk_score?: number }[];
        xposed_data?: { children?: { children?: { name?: string; value?: number }[] }[] }[];
      } | null;
      PastesSummary?: { cnt?: number } | null;
    };

    const details = json.ExposedBreaches?.breaches_details ?? [];

    const empty: BreachReport = {
      email,
      found: false,
      count: 0,
      firstYear: null,
      lastYear: null,
      totalRecords: 0,
      dataTypes: [],
      riskLabel: "Clear",
      riskScore: 0,
      pastes: json.PastesSummary?.cnt ?? 0,
      breaches: [],
    };

    if (details.length === 0) return empty;

    const catalog = await fetchCatalog();

    const breaches: BreachRecord[] = details.map((raw) => {
      const d = raw as Record<string, string | number | undefined>;
      const id = String(d.breach ?? "Unknown");
      const cat = catalog.get(id);
      const types = String(d.xposed_data ?? "")
        .split(";")
        .map(clean)
        .filter(Boolean);

      return {
        id,
        name: id.replace(/([a-z])([A-Z])/g, "$1 $2"),
        domain: String(d.domain ?? cat?.domain ?? ""),
        industry: String(d.industry ?? cat?.industry ?? ""),
        logo: String(d.logo ?? cat?.logo ?? ""),
        description: String(d.details ?? cat?.exposureDescription ?? ""),
        dataTypes: types.length ? types : (cat?.exposedData ?? []).map(clean).filter(Boolean),
        records: Number(d.xposed_records ?? cat?.exposedRecords ?? 0),
        year: String(d.xposed_date ?? toYear(cat?.breachedDate) ?? ""),
        breachedDate: cat?.breachedDate ?? null,
        addedDate: String(d.added ?? cat?.addedDate ?? "") || null,
        passwordRisk: String(d.password_risk ?? cat?.passwordRisk ?? "unknown"),
        verified: String(d.verified ?? "") === "Yes" || cat?.verified === true,
        reference: String(d.references ?? cat?.referenceURL ?? ""),
      };
    });

    breaches.sort((a, b) => {
      const av = a.breachedDate ?? a.year;
      const bv = b.breachedDate ?? b.year;
      return bv.localeCompare(av);
    });

    const counts = new Map<string, number>();
    for (const b of breaches) {
      for (const t of b.dataTypes) counts.set(t, (counts.get(t) ?? 0) + 1);
    }

    const years = breaches.map((b) => b.year).filter(Boolean).sort();
    const risk = json.BreachMetrics?.risk?.[0];

    return {
      email,
      found: true,
      count: breaches.length,
      firstYear: years[0] ?? null,
      lastYear: years[years.length - 1] ?? null,
      totalRecords: breaches.reduce((sum, b) => sum + b.records, 0),
      dataTypes: [...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      riskLabel: risk?.risk_label ?? "Unknown",
      riskScore: risk?.risk_score ?? 0,
      pastes: json.PastesSummary?.cnt ?? 0,
      breaches,
    };
  });

export const getRecentBreaches = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ limit: z.number().min(1).max(120) }).parse(data))
  .handler(async ({ data }): Promise<BreachRecord[]> => {
    const res = await fetch(`${API}/breaches`, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error("Could not load the breach catalogue.");
    const json = (await res.json()) as { exposedBreaches?: CatalogEntry[] };

    return (json.exposedBreaches ?? [])
      .map((entry) => ({
        id: entry.breachID,
        name: entry.breachID.replace(/([a-z])([A-Z])/g, "$1 $2"),
        domain: entry.domain ?? "",
        industry: entry.industry ?? "",
        logo: entry.logo ?? "",
        description: entry.exposureDescription ?? "",
        dataTypes: (entry.exposedData ?? []).map(clean).filter(Boolean),
        records: entry.exposedRecords ?? 0,
        year: toYear(entry.breachedDate) ?? "",
        breachedDate: entry.breachedDate ?? null,
        addedDate: entry.addedDate ?? null,
        passwordRisk: entry.passwordRisk ?? "unknown",
        verified: entry.verified ?? false,
        reference: entry.referenceURL ?? "",
      }))
      .sort((a, b) => (b.breachedDate ?? "").localeCompare(a.breachedDate ?? ""))
      .slice(0, data.limit);
  });
