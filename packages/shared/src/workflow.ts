import type {DomainId} from './models';

export const DOMAIN_SEQUENCE: DomainId[] = [
  'domain-1-framing',
  'domain-2-analytics-framing',
  'domain-3-data',
  'domain-4-methodology',
  'domain-5-build',
  'domain-6-deploy',
  'domain-7-lifecycle',
];

export function getNextDomain(domain: DomainId): DomainId | null {
  const index = DOMAIN_SEQUENCE.indexOf(domain);
  if (index < 0 || index === DOMAIN_SEQUENCE.length - 1) {
    return null;
  }
  return DOMAIN_SEQUENCE[index + 1];
}

export function canAdvanceDomain(
  requiredArtifactStatuses: Array<'approved' | 'pending'>,
  checklistComplete: boolean,
  policyPass: boolean,
): boolean {
  return checklistComplete && policyPass && requiredArtifactStatuses.every((status) => status === 'approved');
}
