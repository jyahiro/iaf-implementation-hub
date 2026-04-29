import type {PrimaryJurisdictionId} from '@site/src/context/hubJurisdictionTypes';

export type DemoJurisdictionCopy = {
  headline: string;
  bullets: string[];
};

export const DEMO_JURISDICTION_COPY: Record<PrimaryJurisdictionId, DemoJurisdictionCopy> = {
  'federal-civilian-agency': {
    headline: 'Federal civilian agency lens',
    bullets: [
      'Federal Register and eCFR assists align with how civilian agencies anchor rulemaking and compliance.',
      'The docs sidebar keeps federal mandate–heavy items (including disposition where tagged) easy to find for this profile.',
    ],
  },
  'state-local-program': {
    headline: 'State / local program lens',
    bullets: [
      'This demo frames delivery, interoperability, and cross-program exchange—typical of state or municipal programs.',
      'The sidebar may hide some purely federal disposition depth where frontmatter marks it out of scope for state/local.',
    ],
  },
  'local-health-department': {
    headline: 'Local public-health lens',
    bullets: [
      'Emphasis shifts toward privacy, HIPAA-aligned templates, and community health operations.',
      'Deep federal records-disposition items are de-emphasized in the sidebar when tagged as out of scope for this profile.',
    ],
  },
  'connector-intermediary': {
    headline: 'Connector / intermediary lens',
    bullets: [
      'Use this when you steward data across organizations (HIEs, QIOs, integrators, federated governance).',
      'Regulatory anchors still apply—confirm each anchor fits the cross-boundary agreements you operate under.',
    ],
  },
};
