/**
 * Phase A: read-only helpers for Federal Register and eCFR public APIs.
 * Calls are made from the browser; respect each service's terms of use and rate limits.
 *
 * - Federal Register: https://www.federalregister.gov/developers/documentation/api/v1
 * - eCFR: https://www.ecfr.gov/developers/documentation/api/v1
 */

const FR_API = 'https://www.federalregister.gov/api/v1';
const ECFR_API = 'https://www.ecfr.gov/api/versioner/v1';

export type RegulatoryAnchorSource = 'federal_register' | 'ecfr';

/** User-confirmed citation the wizard carries across all seven domains. */
export interface RegulatoryAnchor {
  id: string;
  source: RegulatoryAnchorSource;
  title: string;
  url: string;
  addedAt: string;
}

export interface InitiativeRegulatoryContext {
  frSearchTerm: string;
  frAgencyId: number | null;
  anchors: RegulatoryAnchor[];
}

export interface FrAgency {
  id: number;
  name: string;
  slug: string;
  shortName?: string;
}

export interface FrDocumentHit {
  documentNumber: string;
  title: string;
  abstract: string;
  htmlUrl: string;
  publicationDate: string;
}

export interface EcfrTitleRow {
  number: number;
  name: string;
  reserved?: boolean;
}

export const REGULATORY_CONTEXT_STORAGE_KEY = 'iaf-demo-regulatory-context-v1';

export function emptyRegulatoryContext(): InitiativeRegulatoryContext {
  return {
    frSearchTerm: '',
    frAgencyId: null,
    anchors: [],
  };
}

export function loadRegulatoryContextFromStorage(): InitiativeRegulatoryContext | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(REGULATORY_CONTEXT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as InitiativeRegulatoryContext;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.anchors)) {
      return null;
    }
    return {
      frSearchTerm: String(parsed.frSearchTerm ?? ''),
      frAgencyId: typeof parsed.frAgencyId === 'number' ? parsed.frAgencyId : null,
      anchors: parsed.anchors.filter(
        (a) => a && typeof a.id === 'string' && typeof a.title === 'string' && typeof a.url === 'string',
      ) as RegulatoryAnchor[],
    };
  } catch {
    return null;
  }
}

export function saveRegulatoryContextToStorage(ctx: InitiativeRegulatoryContext): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  window.localStorage.setItem(REGULATORY_CONTEXT_STORAGE_KEY, JSON.stringify(ctx));
}

export function createFrAnchor(hit: FrDocumentHit): RegulatoryAnchor {
  return {
    id: `fr-${hit.documentNumber}`,
    source: 'federal_register',
    title: hit.title,
    url: hit.htmlUrl,
    addedAt: new Date().toISOString(),
  };
}

export function createEcfrTitleAnchor(row: EcfrTitleRow): RegulatoryAnchor {
  return {
    id: `ecfr-title-${row.number}`,
    source: 'ecfr',
    title: `eCFR Title ${row.number}: ${row.name}`,
    url: `https://www.ecfr.gov/current/title-${row.number}`,
    addedAt: new Date().toISOString(),
  };
}

/** First page of agencies (large list); filter client-side for UX. */
export async function fetchFrAgencies(perPage = 500): Promise<FrAgency[]> {
  const response = await fetch(`${FR_API}/agencies.json?per_page=${perPage}`);
  if (!response.ok) {
    throw new Error(`Federal Register agencies request failed (${response.status})`);
  }
  const data: unknown = await response.json();
  const rows = Array.isArray(data) ? data : [];
  return (rows as Array<{id: number; name: string; slug: string; short_name?: string}>).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    shortName: r.short_name,
  }));
}

export async function searchFrDocuments(options: {
  term: string;
  agencyId?: number | null;
  perPage?: number;
}): Promise<FrDocumentHit[]> {
  const params = new URLSearchParams();
  params.set('per_page', String(options.perPage ?? 8));
  params.set('order', 'newest');
  const term = options.term.trim();
  if (term) {
    params.set('conditions[term]', term);
  }
  if (options.agencyId != null && options.agencyId > 0) {
    params.append('conditions[agency_ids][]', String(options.agencyId));
  }
  const response = await fetch(`${FR_API}/documents.json?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Federal Register documents request failed (${response.status})`);
  }
  const payload = (await response.json()) as {
    results?: Array<{
      document_number: string;
      title: string;
      abstract: string;
      html_url: string;
      publication_date: string;
    }>;
  };
  const results = payload.results ?? [];
  return results.map((r) => ({
    documentNumber: r.document_number,
    title: r.title,
    abstract: r.abstract ?? '',
    htmlUrl: r.html_url,
    publicationDate: r.publication_date ?? '',
  }));
}

export async function fetchEcfrTitles(): Promise<EcfrTitleRow[]> {
  const response = await fetch(`${ECFR_API}/titles.json`);
  if (!response.ok) {
    throw new Error(`eCFR titles request failed (${response.status})`);
  }
  const payload = (await response.json()) as {
    titles?: Array<{number: number; name: string; reserved?: boolean}>;
  };
  return (payload.titles ?? []).filter((t) => !t.reserved);
}
