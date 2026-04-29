export type HubUserContext = 'federal-agency' | 'state-local' | 'connector';

export type PrimaryJurisdictionId =
  | 'federal-civilian-agency'
  | 'state-local-program'
  | 'local-health-department'
  | 'connector-intermediary';

export type HubDocMeta = {
  hub_core?: boolean;
  hub_contexts?: HubUserContext[];
  hub_jurisdiction_tags?: string[];
};

export type JurisdictionProfile = {
  id: PrimaryJurisdictionId;
  label: string;
  subtitle: string;
  /** Relationship to the data asset (A). */
  relationship: string;
  /** Doc must match at least one of these `hub_contexts` values when the doc declares contexts. */
  allowedContexts: HubUserContext[];
  /** If a doc's `hub_jurisdiction_tags` intersects this set, it is hidden from the sidebar. */
  hiddenTags: string[];
};

export const JURISDICTION_PROFILES: Record<PrimaryJurisdictionId, JurisdictionProfile> = {
  'federal-civilian-agency': {
    id: 'federal-civilian-agency',
    label: 'Federal agency (civilian)',
    subtitle: 'Compliance & stewardship — NARA, FISMA, OMB-heavy operating picture.',
    relationship: 'Mandate-heavy federal controls on agency data assets and systems.',
    allowedContexts: ['federal-agency', 'connector'],
    hiddenTags: [],
  },
  'state-local-program': {
    id: 'state-local-program',
    label: 'State / local government program',
    subtitle: 'Interoperability & service delivery — Medicaid, transportation, public safety, and shared programs.',
    relationship: 'Mission-heavy delivery and cross-program data exchange.',
    allowedContexts: ['state-local', 'federal-agency', 'connector'],
    hiddenTags: [],
  },
  'local-health-department': {
    id: 'local-health-department',
    label: 'Local health department',
    subtitle: 'Privacy / HIPAA alignment; de-emphasize federal records disposition where not in scope.',
    relationship: 'Public-health data assets with strong privacy and exchange obligations.',
    allowedContexts: ['state-local', 'federal-agency', 'connector'],
    hiddenTags: ['nara-archival'],
  },
  'connector-intermediary': {
    id: 'connector-intermediary',
    label: 'Connector (intermediary)',
    subtitle: 'Data exchange & federated governance — HIEs, QIOs, integrators, and cross-boundary stewards.',
    relationship: 'Federated governance across organizations that share or link data assets.',
    allowedContexts: ['connector', 'federal-agency', 'state-local'],
    hiddenTags: [],
  },
};

export const STORAGE_KEY = 'iaf-hub-primary-jurisdiction';

export const DEFAULT_JURISDICTION: PrimaryJurisdictionId = 'federal-civilian-agency';
