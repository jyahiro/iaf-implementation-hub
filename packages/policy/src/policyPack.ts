export interface PolicyControl {
  id: string;
  framework: 'evidence-act' | 'm-23-15' | 'open-data-fds' | 'nist-ai-rmf-m-24-10' | 'nist-800-53';
  domainScope: string[];
  title: string;
  requiredEvidenceKeys: string[];
}

export const POLICY_PACK: PolicyControl[] = [
  {
    id: 'evidence-act-001',
    framework: 'evidence-act',
    domainScope: ['domain-1-framing', 'domain-2-analytics-framing', 'domain-3-data'],
    title: 'Evidence-building objective is documented and sponsor-approved',
    requiredEvidenceKeys: ['learningQuestions', 'sponsorApprovalRecord'],
  },
  {
    id: 'm-23-15-001',
    framework: 'm-23-15',
    domainScope: ['domain-1-framing'],
    title: 'Evidence planning checklist completed',
    requiredEvidenceKeys: ['m2315Checklist', 'stakeholderAlignmentRecord'],
  },
  {
    id: 'open-data-fds-001',
    framework: 'open-data-fds',
    domainScope: ['domain-3-data'],
    title: 'Data inventory and metadata controls are documented',
    requiredEvidenceKeys: ['dataInventory', 'metadataComplianceRecord'],
  },
  {
    id: 'ai-rmf-001',
    framework: 'nist-ai-rmf-m-24-10',
    domainScope: ['domain-5-build', 'domain-6-deploy'],
    title: 'AI risk management assurance case documented',
    requiredEvidenceKeys: ['airmfAssuranceCase', 'm2410ControlMapping'],
  },
  {
    id: 'nist-800-53-au-001',
    framework: 'nist-800-53',
    domainScope: ['domain-1-framing', 'domain-2-analytics-framing', 'domain-3-data', 'domain-4-methodology', 'domain-5-build', 'domain-6-deploy', 'domain-7-lifecycle'],
    title: 'Audit events are recorded for approval and stage-transition actions',
    requiredEvidenceKeys: ['auditTrailEnabled', 'auditEventsExport'],
  },
];
