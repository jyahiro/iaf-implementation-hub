/**
 * Canonical IAF domain titles aligned to INFORMS Analytics Framework reference
 * materials in `references/` (wheel / task materials) and the Task RACI Matrix.
 */

export interface IafDomainDefinition {
  id: string;
  romanNumeral: string;
  /** Title text after "Domain N: " */
  shortTitle: string;
  /** Full label used in UI and exports, e.g. "Domain I: Business Problem (Question) Framing" */
  displayLabel: string;
  /** Docusaurus docs slug path segment (under docs/domains/) */
  docFileStem: string;
  templateId: string;
  serviceId: string;
  objectiveLabel: string;
}

export const IAF_DOMAIN_DEFINITIONS: IafDomainDefinition[] = [
  {
    id: 'domain-1-framing',
    romanNumeral: 'I',
    shortTitle: 'Business Problem (Question) Framing',
    displayLabel: 'Domain I: Business Problem (Question) Framing',
    docFileStem: 'business-problem-framing',
    templateId: 'template-domain-1-business-problem-brief',
    serviceId: 'service-01',
    objectiveLabel: 'Business problem and outcomes',
  },
  {
    id: 'domain-2-analytics-framing',
    romanNumeral: 'II',
    shortTitle: 'Analytics Problem Framing',
    displayLabel: 'Domain II: Analytics Problem Framing',
    docFileStem: 'analytics-problem-framing',
    templateId: 'template-domain-2-analytics-problem-statement',
    serviceId: 'service-01',
    objectiveLabel: 'Analytics question and success metrics',
  },
  {
    id: 'domain-3-data',
    romanNumeral: 'III',
    shortTitle: 'Data',
    displayLabel: 'Domain III: Data',
    docFileStem: 'data-readiness',
    templateId: 'template-domain-3-data-readiness-assessment',
    serviceId: 'service-02',
    objectiveLabel: 'Data readiness and governance controls',
  },
  {
    id: 'domain-4-methodology',
    romanNumeral: 'IV',
    shortTitle: 'Methodology (Approach) Framing',
    displayLabel: 'Domain IV: Methodology (Approach) Framing',
    docFileStem: 'methodology-selection',
    templateId: 'template-domain-4-method-selection-record',
    serviceId: 'service-03',
    objectiveLabel: 'Method and architecture selection',
  },
  {
    id: 'domain-5-build',
    romanNumeral: 'V',
    shortTitle: 'Analytics/Model Development',
    displayLabel: 'Domain V: Analytics/Model Development',
    docFileStem: 'model-building',
    templateId: 'template-domain-5-model-validation-report',
    serviceId: 'service-03',
    objectiveLabel: 'Model validation and risk documentation',
  },
  {
    id: 'domain-6-deploy',
    romanNumeral: 'VI',
    shortTitle: 'Deployment',
    displayLabel: 'Domain VI: Deployment',
    docFileStem: 'deployment',
    templateId: 'template-domain-6-7-operational-lifecycle-review',
    serviceId: 'service-04',
    objectiveLabel: 'Deployment readiness and controls',
  },
  {
    id: 'domain-7-lifecycle',
    romanNumeral: 'VII',
    shortTitle: 'Analytics Solution Lifecycle Management',
    displayLabel: 'Domain VII: Analytics Solution Lifecycle Management',
    docFileStem: 'lifecycle-management',
    templateId: 'template-domain-6-7-operational-lifecycle-review',
    serviceId: 'service-05',
    objectiveLabel: 'Monitoring, recalibration, and sustainment',
  },
];

const byId = new Map(IAF_DOMAIN_DEFINITIONS.map((d) => [d.id, d]));

export function getIafDomainDefinition(domainId: string): IafDomainDefinition | undefined {
  return byId.get(domainId);
}
