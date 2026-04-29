import React, {useEffect, useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {getIafDomainDefinition, IAF_DOMAIN_DEFINITIONS} from '@site/src/data/iafDomains';
import {
  createEcfrTitleAnchor,
  createFrAnchor,
  emptyRegulatoryContext,
  fetchEcfrTitles,
  fetchFrAgencies,
  loadRegulatoryContextFromStorage,
  type EcfrTitleRow,
  type FrAgency,
  type FrDocumentHit,
  type InitiativeRegulatoryContext,
  type RegulatoryAnchor,
  saveRegulatoryContextToStorage,
  searchFrDocuments,
} from '@site/src/lib/regulatoryApi';

const MASTER_ROLES = {
  sponsor: {label: 'Group Manager', shortCode: 'GM'},
  reviewer: {label: 'Team Lead', shortCode: 'TL'},
  program_manager: {label: 'Project Lead', shortCode: 'PL'},
  data_scientist: {label: 'Data Scientist', shortCode: 'DS'},
  data_engineer: {label: 'DevOps Engineer', shortCode: 'DO'},
  analyst: {label: 'Application Developer', shortCode: 'AP'},
  data_steward: {label: 'Data Engineer', shortCode: 'DE'},
  admin: {label: 'Platform Admin', shortCode: 'AD'},
} as const;

type Role = keyof typeof MASTER_ROLES;

type WizardStep = 'connection' | 'login' | 'project' | 'domain' | 'summary';

interface DomainStep {
  id: string;
  label: string;
  templateId: string;
  serviceId: string;
  objectiveLabel: string;
}

interface DomainStandardRequirement {
  exitCriteria: string;
  requiredArtifacts: string[];
  policyReference: string;
  governanceGateObjective: string;
}

interface DomainStandardCheck {
  id: string;
  label: string;
  complete: boolean;
}

interface ConsistencyCheck {
  id: string;
  label: string;
  complete: boolean;
}

interface DomainResponse {
  objective: string;
  roleNote: string;
  policyRisk: string;
  checklistComplete: boolean;
  artifactComplete: boolean;
  serviceComplete: boolean;
  taskStatus: Record<string, boolean>;
  taskForms: Record<string, TaskFormState>;
}

interface RoleTaskFocus {
  primary: string[];
  supporting: string[];
}

interface DomainTaskProfile {
  allTasks: string[];
  byRole: Partial<Record<Role, RoleTaskFocus>>;
}

interface TaskFormState {
  workflowValues: Record<string, string>;
}

interface TaskWorkflowField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'people';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  helpText?: string;
}

interface TaskWorkflowDefinition {
  summary: string;
  fields: TaskWorkflowField[];
}

interface IcamPerson {
  id: string;
  displayName: string;
  email: string;
  roleTitle: string;
  organization: string;
}

const TASK_REFERENCE_PATH = '/docs/legal-policy/role-task-matrix/';
const TASK_DESCRIPTIONS: Record<string, string> = {
  '1.1': 'Define mission problem and measurable outcomes.',
  '1.2': 'Identify stakeholders and decision cadence.',
  '1.3': 'Capture decision criteria and constraints.',
  '1.4': 'Define scope boundaries and assumptions.',
  '1.5': 'Confirm governance and approval pathway.',
  '1.6': 'Approve problem framing brief for execution.',
  '2.1': 'Translate business problem into analytics objectives.',
  '2.2': 'Define candidate analytical approaches.',
  '2.3': 'Set success metrics and performance thresholds.',
  '2.4': 'Document assumptions and trade-offs.',
  '2.5': 'Select preferred analytics approach.',
  '2.6': 'Define acceptance criteria for next gate.',
  '2.7': 'Authorize transition to data readiness activities.',
  '3.1': 'Inventory data sources and owners.',
  '3.2': 'Classify data sensitivity and handling requirements.',
  '3.3': 'Assess data quality and fitness for use.',
  '3.4': 'Design ingestion, transformation, and lineage flow.',
  '3.5': 'Implement secure data access and controls.',
  '3.6': 'Produce data readiness evidence package.',
  '3.7': 'Resolve critical data risks and exceptions.',
  '3.8': 'Approve data baseline for methodology selection.',
  '4.1': 'Define candidate method families and fit criteria.',
  '4.2': 'Evaluate methods against constraints and mission needs.',
  '4.3': 'Define architecture and integration approach.',
  '4.4': 'Approve selected methodology and delivery approach.',
  '5.1': 'Prepare development-ready analytic datasets.',
  '5.2': 'Develop baseline and candidate models.',
  '5.3': 'Validate model performance and robustness.',
  '5.4': 'Assess model risk, fairness, and explainability.',
  '5.5': 'Package model artifacts for deployment.',
  '5.6': 'Approve model release readiness.',
  '6.1': 'Finalize deployment plan and operational controls.',
  '6.2': 'Complete implementation readiness review.',
  '6.3': 'Authorize production deployment.',
  '6.4': 'Execute deployment and cutover steps.',
  '6.5': 'Establish observability and incident workflows.',
  '6.6': 'Validate deployed solution against acceptance criteria.',
  '7.1': 'Track operational performance and mission outcomes.',
  '7.2': 'Monitor drift and trigger retraining thresholds.',
  '7.3': 'Manage change requests and version governance.',
  '7.4': 'Conduct periodic oversight and compliance reviews.',
  '7.5': 'Prioritize enhancements and deprecation actions.',
  '7.6': 'Document closure, sustainment, or retirement decisions.',
};

const DUMMY_ICAM_DIRECTORY: IcamPerson[] = [
  {id: 'u-001', displayName: 'Avery Johnson', email: 'avery.johnson@agency.gov', roleTitle: 'Project Lead', organization: 'Permitting Office'},
  {id: 'u-002', displayName: 'Jordan Lee', email: 'jordan.lee@agency.gov', roleTitle: 'Data Engineer', organization: 'Data Governance Office'},
  {id: 'u-003', displayName: 'Taylor Smith', email: 'taylor.smith@agency.gov', roleTitle: 'Policy Advisor', organization: 'General Counsel'},
  {id: 'u-004', displayName: 'Casey Brown', email: 'casey.brown@agency.gov', roleTitle: 'Operations Lead', organization: 'Regional Operations'},
  {id: 'u-005', displayName: 'Morgan Davis', email: 'morgan.davis@agency.gov', roleTitle: 'DevOps Engineer', organization: 'Enterprise Data Platform'},
  {id: 'u-006', displayName: 'Riley Patel', email: 'riley.patel@agency.gov', roleTitle: 'Group Manager', organization: 'Mission Directorate'},
  {id: 'u-007', displayName: 'Quinn Wilson', email: 'quinn.wilson@agency.gov', roleTitle: 'Team Lead', organization: 'Independent Oversight'},
  {id: 'u-008', displayName: 'Jamie Garcia', email: 'jamie.garcia@agency.gov', roleTitle: 'Application Developer', organization: 'Performance Analytics'},
];

const TASK_WORKFLOW_DEFINITIONS: Record<string, TaskWorkflowDefinition> = {
  '1.1': {
    summary: 'Define a clear mission problem statement and intended outcomes.',
    fields: [
      {id: 'problemStatement', label: 'Mission Problem Statement', type: 'textarea', required: true},
      {
        id: 'targetOutcome',
        label: 'Target Outcome Metric',
        type: 'text',
        required: true,
        helpText: 'Include a measurable performance target (for example, reduce cycle time by 20%).',
      },
      {
        id: 'timeHorizon',
        label: 'Decision Time Horizon',
        type: 'select',
        required: true,
        options: ['30 days', '90 days', '6 months', '12 months'],
        helpText: 'Choose the timeframe in which leaders expect decision impact.',
      },
    ],
  },
  '1.2': {
    summary: 'Identify stakeholders and establish the decision cadence for governance.',
    fields: [
      {
        id: 'primaryStakeholders',
        label: 'Primary Stakeholders (ICAM search)',
        type: 'people',
        required: true,
        placeholder: 'Type name or email to search the personnel directory.',
        helpText:
          'Search the ICAM directory by name or email, then select stakeholders to include in this task.',
      },
      {
        id: 'decisionOwner',
        label: 'Decision Owner Role',
        type: 'select',
        required: true,
        options: ['Group Manager', 'Project Lead', 'Authorizing Official', 'Architecture review board'],
        helpText: 'Select who has final authority for this domain decision.',
      },
      {
        id: 'cadence',
        label: 'Decision Cadence',
        type: 'select',
        required: true,
        options: ['Weekly', 'Bi-weekly', 'Monthly', 'Gate-based only'],
        helpText: 'Set how often decisions/checkpoints occur during execution.',
      },
      {
        id: 'cadenceRationale',
        label: 'Cadence Rationale',
        type: 'textarea',
        required: true,
        helpText: 'Explain why this cadence fits risk, workload, and governance needs.',
      },
    ],
  },
  '1.3': {
    summary: 'Capture decision criteria and constraints for scope control.',
    fields: [
      {id: 'decisionCriteria', label: 'Decision Criteria', type: 'textarea', required: true},
      {
        id: 'constraints',
        label: 'Constraints (policy, timeline, budget)',
        type: 'textarea',
        required: true,
        helpText: 'Capture known legal, schedule, budget, and operational limits.',
      },
    ],
  },
  '1.4': {
    summary: 'Set clear scope boundaries and assumptions.',
    fields: [
      {id: 'inScope', label: 'In Scope', type: 'textarea', required: true},
      {id: 'outOfScope', label: 'Out of Scope', type: 'textarea', required: true},
      {
        id: 'keyAssumptions',
        label: 'Key Assumptions',
        type: 'textarea',
        required: true,
        helpText: 'Document assumptions that, if invalidated, would change solution direction.',
      },
    ],
  },
  '1.5': {
    summary: 'Confirm governance checkpoints and approvals.',
    fields: [
      {id: 'approvalChain', label: 'Approval Chain', type: 'textarea', required: true},
      {
        id: 'checkpointCadence',
        label: 'Checkpoint Cadence',
        type: 'select',
        required: true,
        options: ['Domain gate checkpoints', 'Bi-weekly + gates', 'Monthly + gates'],
        helpText: 'Define governance checkpoint rhythm that ensures oversight without blocking delivery.',
      },
    ],
  },
  '1.6': {
    summary: 'Record final framing approval to proceed.',
    fields: [
      {
        id: 'approvalDecision',
        label: 'Approval Decision',
        type: 'select',
        required: true,
        options: ['Approved', 'Conditional Approval', 'Not Approved'],
        helpText: 'Record the formal decision outcome for Domain I completion.',
      },
      {
        id: 'approvalConditions',
        label: 'Conditions / Notes',
        type: 'textarea',
        required: true,
        helpText: 'Include any remediation conditions, caveats, or next-step requirements.',
      },
    ],
  },
};

const GENERIC_TASK_WORKFLOW: TaskWorkflowDefinition = {
  summary: 'Capture how this task was performed and what evidence supports completion.',
  fields: [
    {
      id: 'workPerformed',
      label: 'Work Performed',
      type: 'textarea',
      required: true,
      helpText: 'Describe the concrete steps completed for this task.',
    },
    {
      id: 'evidenceProduced',
      label: 'Evidence Produced',
      type: 'textarea',
      required: true,
      helpText: 'List artifacts, decisions, or outputs that prove completion.',
    },
  ],
};

interface LocalDemoState {
  users: Array<{userId: string; email: string; role: Role}>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    ownerId: string;
    currentDomain: string;
    createdAt: string;
  }>;
  artifacts: Array<{
    id: string;
    projectId: string;
    templateId: string;
    title: string;
    markdown: string;
    status: string;
    ownerId: string;
    version: number;
    updatedAt: string;
  }>;
  serviceRequests: Array<{
    id: string;
    projectId: string;
    serviceId: string;
    status: string;
    requestedBy: string;
    createdAt: string;
    outputArtifactIds: string[];
  }>;
  auditEvents: Array<{
    id: string;
    eventType: string;
    actorId: string;
    payload: Record<string, unknown>;
    timestamp: string;
  }>;
}

const LOCAL_STATE_KEY = 'iaf-demo-local-state-v2';

const DOMAIN_STEPS: DomainStep[] = IAF_DOMAIN_DEFINITIONS.map((definition) => ({
  id: definition.id,
  label: definition.displayLabel,
  templateId: definition.templateId,
  serviceId: definition.serviceId,
  objectiveLabel: definition.objectiveLabel,
}));

const DOMAIN_STANDARD_REQUIREMENTS: Record<string, DomainStandardRequirement> = {
  'domain-1-framing': {
    exitCriteria: 'Problem statement approved and sponsor/stakeholder alignment recorded.',
    requiredArtifacts: [
      'Business Problem Statement',
      'Stakeholder Register',
      'M-13-13 Open Data Policy Governance Checklist',
    ],
    policyReference: 'Evidence Act (Title I)',
    governanceGateObjective: 'Align framing with the agency learning agenda.',
  },
  'domain-2-analytics-framing': {
    exitCriteria: 'Analytics question and success criteria approved for data readiness.',
    requiredArtifacts: ['Analytics Problem Statement', 'Success Metrics Baseline'],
    policyReference: 'IAF governance baseline',
    governanceGateObjective: 'Maintain traceable analytical framing for downstream quality assurance.',
  },
  'domain-3-data': {
    exitCriteria: 'Data is validated as fit for purpose with governance controls documented.',
    requiredArtifacts: [
      'Data Management Plan',
      'Data Quality Report',
      'OPEN Data/FDS Compliance Record',
    ],
    policyReference: 'IQA / OPEN Government Data Act',
    governanceGateObjective: 'Ensure data meets fit-for-purpose quality standards.',
  },
  'domain-4-methodology': {
    exitCriteria: 'Method and architecture approach approved for development.',
    requiredArtifacts: ['Method Selection Record', 'Approach Trade-off Summary'],
    policyReference: 'IAF governance baseline',
    governanceGateObjective: 'Select methods that are transparent, defensible, and mission-appropriate.',
  },
  'domain-5-build': {
    exitCriteria: 'Model performance validated and deployment recommendation documented.',
    requiredArtifacts: ['Model Validation Report', 'Findings Briefing', 'AI RMF/M-24-10 Assurance Case'],
    policyReference: 'NIST AI RMF / OMB M-24-10',
    governanceGateObjective: 'Demonstrate AI risk assessment and bias mitigation.',
  },
  'domain-6-deploy': {
    exitCriteria: 'Production readiness validated and deployment gate approved.',
    requiredArtifacts: [
      'Deployment Validation Report',
      'Production Requirements',
      'AI RMF/M-24-10 Assurance Case',
    ],
    policyReference: 'NIST AI RMF / OMB M-24-10',
    governanceGateObjective: 'Demonstrate AI risk assessment and bias mitigation.',
  },
  'domain-7-lifecycle': {
    exitCriteria: 'Monitoring and recalibration controls documented for sustainment.',
    requiredArtifacts: ['Operational Lifecycle Review', 'Monitoring and Recalibration Plan'],
    policyReference: 'NARA Records Schedules',
    governanceGateObjective: 'Ensure analytics outputs are properly archived/disposed.',
  },
};

const ROLE_PROMPTS: Record<Role, string> = {
  sponsor: 'Document decision authority, priorities, and approval thresholds the Group Manager must uphold (TDSP).',
  program_manager:
    'Document scope, success metrics, stakeholder commitments, and delivery dependencies owned by the Project Lead (TDSP).',
  analyst: 'Document application or integration changes, APIs, and acceptance evidence expected of the Application Developer (TDSP).',
  data_engineer:
    'Document pipelines, environments, release mechanics, and observability owned by the DevOps Engineer (TDSP).',
  data_scientist: 'Document modeling approach, experiments, validation, and monitoring criteria owned by the Data Scientist (TDSP).',
  data_steward: 'Document data products, transformations, quality, and lineage owned by the Data Engineer (TDSP).',
  reviewer: 'Document review cadence, quality bar, and gate evidence expected of the Team Lead (TDSP).',
  admin: 'Document platform, access, and audit configuration implications for this domain.',
};

const DOMAIN_TASK_MATRIX: Record<string, DomainTaskProfile> = {
  'domain-1-framing': {
    allTasks: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'],
    byRole: {
      sponsor: {primary: ['1.6', '1.5'], supporting: ['1.2']},
      program_manager: {primary: ['1.2', '1.4'], supporting: ['1.5']},
      analyst: {primary: ['1.1', '1.3'], supporting: ['1.4']},
      reviewer: {primary: ['1.3'], supporting: ['1.6']},
    },
  },
  'domain-2-analytics-framing': {
    allTasks: ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7'],
    byRole: {
      sponsor: {primary: ['2.7'], supporting: ['2.4']},
      program_manager: {primary: ['2.4', '2.6'], supporting: ['2.7']},
      analyst: {primary: ['2.1', '2.2', '2.3'], supporting: ['2.5']},
      data_scientist: {primary: ['2.2', '2.3', '2.5'], supporting: ['2.4']},
      reviewer: {primary: ['2.6'], supporting: ['2.7']},
    },
  },
  'domain-3-data': {
    allTasks: ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8'],
    byRole: {
      program_manager: {primary: ['3.1', '3.7'], supporting: ['3.8']},
      data_steward: {primary: ['3.2', '3.3', '3.6'], supporting: ['3.7']},
      data_engineer: {primary: ['3.4', '3.5'], supporting: ['3.6']},
      analyst: {primary: ['3.6', '3.8'], supporting: ['3.7']},
      reviewer: {primary: ['3.3'], supporting: ['3.7']},
    },
  },
  'domain-4-methodology': {
    allTasks: ['4.1', '4.2', '4.3', '4.4'],
    byRole: {
      program_manager: {primary: ['4.2'], supporting: ['4.4']},
      analyst: {primary: ['4.1', '4.2'], supporting: ['4.3']},
      data_scientist: {primary: ['4.1', '4.2'], supporting: ['4.4']},
      data_engineer: {primary: ['4.3', '4.4'], supporting: ['4.2']},
      reviewer: {primary: ['4.2'], supporting: ['4.4']},
    },
  },
  'domain-5-build': {
    allTasks: ['5.1', '5.2', '5.3', '5.4', '5.5', '5.6'],
    byRole: {
      program_manager: {primary: ['5.6'], supporting: ['5.3']},
      analyst: {primary: ['5.1', '5.3', '5.6'], supporting: ['5.4']},
      data_scientist: {primary: ['5.2', '5.3', '5.4'], supporting: ['5.6']},
      data_engineer: {primary: ['5.5'], supporting: ['5.2']},
      reviewer: {primary: ['5.3', '5.6'], supporting: ['5.4']},
    },
  },
  'domain-6-deploy': {
    allTasks: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6'],
    byRole: {
      sponsor: {primary: ['6.3'], supporting: ['6.1']},
      program_manager: {primary: ['6.1', '6.2', '6.4'], supporting: ['6.3']},
      data_engineer: {primary: ['6.5', '6.6'], supporting: ['6.4']},
      analyst: {primary: ['6.1', '6.6'], supporting: ['6.2']},
      reviewer: {primary: ['6.2', '6.6'], supporting: ['6.3']},
    },
  },
  'domain-7-lifecycle': {
    allTasks: ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6'],
    byRole: {
      sponsor: {primary: ['7.4'], supporting: ['7.1']},
      program_manager: {primary: ['7.1', '7.4', '7.6'], supporting: ['7.5']},
      analyst: {primary: ['7.1', '7.2'], supporting: ['7.5']},
      data_scientist: {primary: ['7.2'], supporting: ['7.1']},
      data_engineer: {primary: ['7.2', '7.6'], supporting: ['7.1']},
      reviewer: {primary: ['7.5', '7.6'], supporting: ['7.4']},
      data_steward: {primary: ['7.6'], supporting: ['7.1']},
    },
  },
};

const containerStyle: React.CSSProperties = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '760px',
  padding: '0.5rem',
  marginBottom: '0.5rem',
};

function FieldLabel({
  htmlFor,
  label,
  helpText,
  className,
}: {
  htmlFor: string;
  label: string;
  helpText: string;
  className?: string;
}): React.JSX.Element {
  return (
    <label htmlFor={htmlFor} className={className}>
      {label}{' '}
      <span className="iaf-demo-field-help" title={helpText} aria-label={`Field help: ${helpText}`} tabIndex={0}>
        i
      </span>
    </label>
  );
}

function defaultTaskFormState(): TaskFormState {
  return {
    workflowValues: {},
  };
}

function getLocalState(): LocalDemoState {
  const existing = localStorage.getItem(LOCAL_STATE_KEY);
  if (existing) {
    return JSON.parse(existing) as LocalDemoState;
  }
  const initial: LocalDemoState = {
    users: [],
    projects: [],
    artifacts: [],
    serviceRequests: [],
    auditEvents: [],
  };
  localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(initial));
  return initial;
}

function setLocalState(state: LocalDemoState) {
  localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
}

function inferFrAgencyFromEmail(email: string, agencies: FrAgency[]): FrAgency | null {
  const domain = email.trim().toLowerCase().split('@')[1] ?? '';
  if (!domain) {
    return null;
  }
  const labels = domain.split('.').filter(Boolean);
  const candidates = labels
    .slice(0, -1)
    .filter((label) => label.length > 1 && !['mail', 'email', 'corp', 'cloud', 'digital', 'team'].includes(label));
  if (!candidates.length) {
    return null;
  }
  const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  for (const agency of agencies) {
    const searchable = normalize(`${agency.name} ${agency.slug} ${agency.shortName ?? ''}`);
    if (candidates.some((token) => searchable.includes(token))) {
      return agency;
    }
  }
  return null;
}

async function requestJson(
  apiBaseUrl: string,
  path: string,
  options: RequestInit = {},
  token: string | null = null,
): Promise<unknown> {
  const headers = new Headers(options.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });
  const payload = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(String(payload.error ?? 'Request failed'));
  }
  return payload;
}

export default function DemoExperience(): React.JSX.Element {
  const taskReferenceBaseUrl = useBaseUrl(TASK_REFERENCE_PATH);
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:4100');
  const [browserOnlyMode, setBrowserOnlyMode] = useState(true);
  const [wizardStep, setWizardStep] = useState<WizardStep>('connection');
  const [email, setEmail] = useState('demo.user@agency.gov');
  const [role, setRole] = useState<Role>('program_manager');
  const [projectName, setProjectName] = useState('Permit Cycle Time Reduction');
  const [projectDescription, setProjectDescription] = useState(
    'Reduce average permit review cycle time while preserving fairness and compliance.',
  );
  const [projectId, setProjectId] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState('{}');
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [domainResponses, setDomainResponses] = useState<Record<string, DomainResponse>>({});
  const [icamMode, setIcamMode] = useState<'dummy' | 'manual'>('dummy');
  const [icamSearchByTask, setIcamSearchByTask] = useState<Record<string, string>>({});
  const [regContext, setRegContext] = useState<InitiativeRegulatoryContext>(() => {
    return loadRegulatoryContextFromStorage() ?? emptyRegulatoryContext();
  });
  const [frAgencies, setFrAgencies] = useState<FrAgency[]>([]);
  const [frAgencyFilter, setFrAgencyFilter] = useState('');
  const [frAgenciesBusy, setFrAgenciesBusy] = useState(false);
  const [frResults, setFrResults] = useState<FrDocumentHit[]>([]);
  const [frQueryBusy, setFrQueryBusy] = useState(false);
  const [ecfrTitles, setEcfrTitles] = useState<EcfrTitleRow[] | null>(null);
  const [ecfrBusy, setEcfrBusy] = useState(false);
  const [ecfrTitlePick, setEcfrTitlePick] = useState<number | ''>('');
  const masterRoleKeys = Object.keys(MASTER_ROLES) as Role[];

  const domainDocsBase = useBaseUrl('/docs/domains/');

  useEffect(() => {
    saveRegulatoryContextToStorage(regContext);
  }, [regContext]);

  const filteredFrAgencies = useMemo(() => {
    const query = frAgencyFilter.trim().toLowerCase();
    if (!query) {
      return frAgencies.slice(0, 80);
    }
    return frAgencies.filter((agency) => `${agency.name} ${agency.slug}`.toLowerCase().includes(query)).slice(0, 80);
  }, [frAgencies, frAgencyFilter]);

  const selectedFrAgency = useMemo(
    () => frAgencies.find((agency) => agency.id === regContext.frAgencyId) ?? null,
    [frAgencies, regContext.frAgencyId],
  );

  const inferredFrAgency = useMemo(() => inferFrAgencyFromEmail(email, frAgencies), [email, frAgencies]);

  useEffect(() => {
    if (wizardStep !== 'project' || frAgencies.length || frAgenciesBusy) {
      return;
    }
    void ensureFrAgencies();
  }, [wizardStep, frAgencies.length, frAgenciesBusy]);

  useEffect(() => {
    if (wizardStep !== 'project' || regContext.frAgencyId != null || !inferredFrAgency) {
      return;
    }
    setRegContext((existing) => {
      if (existing.frAgencyId != null) {
        return existing;
      }
      return {...existing, frAgencyId: inferredFrAgency.id};
    });
    setFrAgencyFilter(inferredFrAgency.name);
  }, [wizardStep, regContext.frAgencyId, inferredFrAgency]);

  function addRegulatoryAnchor(anchor: RegulatoryAnchor): void {
    setRegContext((existing) => {
      if (existing.anchors.some((item) => item.id === anchor.id)) {
        return existing;
      }
      return {...existing, anchors: [...existing.anchors, anchor]};
    });
  }

  function removeRegulatoryAnchor(anchorId: string): void {
    setRegContext((existing) => ({...existing, anchors: existing.anchors.filter((item) => item.id !== anchorId)}));
  }

  function regulatoryNudgeForDomain(domainId: string): string {
    if (!regContext.anchors.length) {
      return '';
    }
    const definition = getIafDomainDefinition(domainId);
    const preview = regContext.anchors.map((anchor) => `– ${anchor.title}`).slice(0, 5).join('\n');
    return `You have ${regContext.anchors.length} confirmed regulatory anchor(s). As you complete ${definition?.displayLabel ?? 'this domain'}, tie decisions and evidence to these sources where applicable:\n${preview}`;
  }

  async function ensureFrAgencies(): Promise<void> {
    if (frAgencies.length || frAgenciesBusy) {
      return;
    }
    setFrAgenciesBusy(true);
    try {
      const list = await fetchFrAgencies(500);
      setFrAgencies(list);
    } finally {
      setFrAgenciesBusy(false);
    }
  }

  async function ensureEcfrTitles(): Promise<void> {
    if (ecfrTitles || ecfrBusy) {
      return;
    }
    setEcfrBusy(true);
    try {
      const titles = await fetchEcfrTitles();
      setEcfrTitles(titles);
    } finally {
      setEcfrBusy(false);
    }
  }

  async function runFrDocumentSearch(): Promise<void> {
    setFrQueryBusy(true);
    try {
      const hits = await searchFrDocuments({
        term: regContext.frSearchTerm || projectDescription,
        agencyId: regContext.frAgencyId,
        perPage: 8,
      });
      setFrResults(hits);
    } finally {
      setFrQueryBusy(false);
    }
  }

  const tokenPreview = useMemo(() => {
    if (!token) {
      return 'No token issued yet.';
    }
    return `${token.slice(0, 24)}...`;
  }, [token]);

  const regAnchorSignature = useMemo(
    () => regContext.anchors.map((anchor) => anchor.id).join('|'),
    [regContext.anchors],
  );

  const currentDomain = DOMAIN_STEPS[currentDomainIndex];
  const currentTaskProfile = DOMAIN_TASK_MATRIX[currentDomain.id];
  const currentRoleTaskFocus = currentTaskProfile.byRole[role];
  const currentResponse =
    domainResponses[currentDomain.id] ??
    ({
      objective: '',
      roleNote: '',
      policyRisk: '',
      checklistComplete: false,
      artifactComplete: false,
      serviceComplete: false,
      taskStatus: {},
      taskForms: {},
    } satisfies DomainResponse);
  const allDomainsComplete = DOMAIN_STEPS.every((step) => {
    const response = domainResponses[step.id];
    return Boolean(response?.checklistComplete && response?.artifactComplete && response?.serviceComplete);
  });

  const roleConsistencyChecks = useMemo<ConsistencyCheck[]>(() => {
    const promptRoles = Object.keys(ROLE_PROMPTS) as Role[];
    const matrixRoles = new Set<Role>();
    for (const profile of Object.values(DOMAIN_TASK_MATRIX)) {
      (Object.keys(profile.byRole) as Role[]).forEach((roleKey) => matrixRoles.add(roleKey));
    }
    return [
      {
        id: 'master-role-list-defined',
        label: 'Master role list is defined and non-empty.',
        complete: masterRoleKeys.length > 0,
      },
      {
        id: 'role-prompts-aligned',
        label: 'Role prompts align 1:1 with master role list.',
        complete:
          masterRoleKeys.every((roleKey) => promptRoles.includes(roleKey)) &&
          promptRoles.every((roleKey) => masterRoleKeys.includes(roleKey)),
      },
      {
        id: 'role-task-matrix-aligned',
        label: 'Role-task matrix references only master-list roles.',
        complete: [...matrixRoles].every((roleKey) => masterRoleKeys.includes(roleKey)),
      },
      {
        id: 'login-selector-aligned',
        label: 'Role selector options are generated from the master role list.',
        complete: true,
      },
    ];
  }, [masterRoleKeys]);

  function taskReferenceLink(taskId: string): string {
    return `${taskReferenceBaseUrl}#task-${taskId.replace('.', '')}`;
  }

  function taskTooltip(taskId: string): string {
    return TASK_DESCRIPTIONS[taskId] ?? 'Open task details in Task RACI Matrix.';
  }

  function getTaskWorkflowDefinition(taskId: string): TaskWorkflowDefinition {
    return TASK_WORKFLOW_DEFINITIONS[taskId] ?? GENERIC_TASK_WORKFLOW;
  }

  function renderTaskLinks(taskIds: string[]): React.JSX.Element {
    return (
      <>
        {taskIds.map((taskId, index) => (
          <React.Fragment key={taskId}>
            <a href={taskReferenceLink(taskId)} target="_blank" rel="noreferrer" title={taskTooltip(taskId)}>
              {taskId}
            </a>
            {index < taskIds.length - 1 ? ', ' : ''}
          </React.Fragment>
        ))}
      </>
    );
  }

  function roleLabel(roleKey: Role): string {
    return MASTER_ROLES[roleKey].label;
  }

  function getPreviousDomainResponse(index: number): DomainResponse | null {
    if (index <= 0) {
      return null;
    }
    const prior = DOMAIN_STEPS[index - 1];
    return domainResponses[prior.id] ?? null;
  }

  function buildSuggestedResponse(index: number): Pick<DomainResponse, 'objective' | 'roleNote' | 'policyRisk'> {
    const step = DOMAIN_STEPS[index];
    const priorResponse = getPreviousDomainResponse(index);
    const priorObjective = priorResponse?.objective?.trim();
    const projectContext = projectName.trim() || 'the project';
    const taskProfile = DOMAIN_TASK_MATRIX[step.id];
    const roleTaskFocus = taskProfile.byRole[role];
    const rolePrimaryTasks = roleTaskFocus?.primary.join(', ') || 'domain-shared tasks';
    const objectiveBase = priorObjective
      ? `Using prior domain output ("${priorObjective}"), define ${step.objectiveLabel.toLowerCase()} for ${projectContext}.`
      : `Define ${step.objectiveLabel.toLowerCase()} for ${projectContext}.`;

    const roleBase = `${ROLE_PROMPTS[role]} ${
      priorObjective ? `Incorporate prior domain context: "${priorObjective}".` : ''
    } Prioritize IAF tasks: ${rolePrimaryTasks}.`.trim();

    const policyBase = `${
      index <= 2
        ? 'Identify legal and policy constraints, data handling requirements, and approval checkpoints.'
        : 'Identify deployment, oversight, and operational risk controls with required approvals.'
    }`.trim();
    const regulatoryHint =
      regContext.anchors.length > 0
        ? ` Tie analysis to confirmed sources: ${regContext.anchors
            .map((anchor) => anchor.title)
            .slice(0, 3)
            .join('; ')}.`
        : '';

    return {
      objective: objectiveBase,
      roleNote: roleBase,
      policyRisk: `${policyBase}${regulatoryHint}`.trim(),
    };
  }

  function previousDomainSummary(): string {
    if (currentDomainIndex === 0) {
      return 'No prior domain yet.';
    }
    const prior = DOMAIN_STEPS[currentDomainIndex - 1];
    const priorResponse = domainResponses[prior.id];
    if (!priorResponse) {
      return 'Previous domain has no saved response yet.';
    }
    return `${prior.label}: ${priorResponse.objective || 'No objective entered.'}`;
  }

  function updateCurrentResponse(patch: Partial<DomainResponse>) {
    setDomainResponses((existing) => ({
      ...existing,
      [currentDomain.id]: {
        ...(existing[currentDomain.id] ?? {
          objective: '',
          roleNote: '',
          policyRisk: '',
          checklistComplete: false,
          artifactComplete: false,
          serviceComplete: false,
          taskStatus: {},
          taskForms: {},
        }),
        ...patch,
      },
    }));
  }

  function getRolePrimaryTasks(domainId: string): string[] {
    const profile = DOMAIN_TASK_MATRIX[domainId];
    return profile.byRole[role]?.primary ?? [];
  }

  function getRoleSupportingTasks(domainId: string): string[] {
    const profile = DOMAIN_TASK_MATRIX[domainId];
    return profile.byRole[role]?.supporting ?? [];
  }

  function allPrimaryTasksComplete(response: DomainResponse, domainId: string): boolean {
    const primaryTasks = getRolePrimaryTasks(domainId);
    if (!primaryTasks.length) {
      return false;
    }
    return primaryTasks.every((taskId) => isTaskFullyComplete(response, taskId));
  }

  function isTaskWorkflowComplete(form: TaskFormState | undefined, taskId: string): boolean {
    const workflow = TASK_WORKFLOW_DEFINITIONS[taskId] ?? GENERIC_TASK_WORKFLOW;
    if (!workflow?.fields?.length) {
      return true;
    }
    return workflow.fields
      .filter((field) => field.required)
      .every((field) => Boolean((form?.workflowValues?.[field.id] ?? '').trim()));
  }

  function isTaskFullyComplete(response: DomainResponse, taskId: string): boolean {
    const form = response.taskForms[taskId];
    return Boolean(response.taskStatus[taskId] && form && isTaskWorkflowComplete(form, taskId));
  }

  function updateTaskForm(taskId: string, patch: Partial<TaskFormState>) {
    const currentTaskForm = currentResponse.taskForms[taskId] ?? defaultTaskFormState();
    const nextTaskForm: TaskFormState = {
      ...currentTaskForm,
      ...patch,
    };
    const nextTaskStatus = {
      ...currentResponse.taskStatus,
      [taskId]: isTaskWorkflowComplete(nextTaskForm, taskId),
    };
    const nextTaskForms = {
      ...currentResponse.taskForms,
      [taskId]: nextTaskForm,
    };
    const provisionalResponse: DomainResponse = {
      ...currentResponse,
      taskStatus: nextTaskStatus,
      taskForms: nextTaskForms,
    };
    updateCurrentResponse({
      taskStatus: nextTaskStatus,
      taskForms: nextTaskForms,
      checklistComplete: allPrimaryTasksComplete(provisionalResponse, currentDomain.id),
    });
  }

  function updateTaskWorkflowValue(taskId: string, fieldId: string, value: string) {
    const currentTaskForm = currentResponse.taskForms[taskId] ?? defaultTaskFormState();
    updateTaskForm(taskId, {
      workflowValues: {
        ...currentTaskForm.workflowValues,
        [fieldId]: value,
      },
    });
  }

  function generateDomainFieldExample(field: 'objective' | 'roleNote' | 'policyRisk'): string {
    const prior = getPreviousDomainResponse(currentDomainIndex);
    const priorObjective = prior?.objective?.trim() || 'previous domain outputs';
    const projectContext = projectName.trim() || 'the project';
    if (field === 'objective') {
      return `For ${projectContext}, define ${currentDomain.objectiveLabel.toLowerCase()} by building on ${priorObjective}.`;
    }
    if (field === 'roleNote') {
      return `${ROLE_PROMPTS[role]} Focus on tasks ${getRolePrimaryTasks(currentDomain.id).join(', ') || 'assigned to this role'} and document decision-ready evidence.`;
    }
    const anchorTail =
      regContext.anchors.length > 0
        ? ` Reference confirmed sources: ${regContext.anchors
            .map((anchor) => anchor.title)
            .slice(0, 3)
            .join('; ')}.`
        : '';
    return `Key policy and risk controls for ${currentDomain.label}: document legal basis, approval checkpoints, data handling constraints, and mitigation actions tied to ${projectContext}.${anchorTail}`;
  }

  function generateWorkflowFieldExample(taskId: string, field: TaskWorkflowField): string {
    const taskDescription = TASK_DESCRIPTIONS[taskId] ?? 'this task';
    const prior = getPreviousDomainResponse(currentDomainIndex);
    const priorObjective = prior?.objective?.trim() || 'prior domain context';
    const projectContext = projectName.trim() || 'the project';
    if (field.id === 'primaryStakeholders') {
      return 'Avery Johnson <avery.johnson@agency.gov>; Jordan Lee <jordan.lee@agency.gov>; Taylor Smith <taylor.smith@agency.gov>';
    }
    if (field.id === 'decisionCriteria') {
      return `Decision criteria for ${projectContext}: measurable mission impact, policy compliance, implementation feasibility, and stakeholder acceptance.`;
    }
    if (field.id === 'constraints') {
      return `Constraints: comply with Evidence Act and open data policy, execute within current fiscal cycle, maintain privacy/security controls, and minimize operational disruption.`;
    }
    return `${taskDescription} for ${projectContext}: align with ${currentDomain.label} using ${priorObjective}, and document concrete outputs supporting gate approval.`;
  }

  function getDomainStandardChecks(response: DomainResponse, domainId: string): DomainStandardCheck[] {
    const requirement = DOMAIN_STANDARD_REQUIREMENTS[domainId];
    return [
      {
        id: 'objective-framing',
        label: 'Decision framing is documented (objective + role context).',
        complete: Boolean(response.objective.trim() && response.roleNote.trim()),
      },
      {
        id: 'policy-governance',
        label: `Policy control satisfied: ${requirement.policyReference}.`,
        complete: Boolean(response.policyRisk.trim()),
      },
      {
        id: 'gate-objective',
        label: `Governance gate objective satisfied: ${requirement.governanceGateObjective}`,
        complete: Boolean(response.policyRisk.trim()),
      },
      {
        id: 'role-task-alignment',
        label: 'Role-aligned required tasks are completed per RACI.',
        complete: allPrimaryTasksComplete(response, domainId),
      },
      {
        id: 'artifact-service-linkage',
        label: 'Domain artifact and linked service request are recorded.',
        complete: Boolean(response.artifactComplete && response.serviceComplete),
      },
    ];
  }

  function areDomainStandardsSatisfied(response: DomainResponse, domainId: string): boolean {
    return getDomainStandardChecks(response, domainId).every((check) => check.complete);
  }

  function parsePeopleValue(value: string): string[] {
    return value
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function addPersonToWorkflow(taskId: string, fieldId: string, person: IcamPerson) {
    const currentRaw = currentResponse.taskForms[taskId]?.workflowValues?.[fieldId] ?? '';
    const selected = parsePeopleValue(currentRaw);
    const token = `${person.displayName} <${person.email}>`;
    if (selected.includes(token)) {
      return;
    }
    const next = [...selected, token].join('; ');
    updateTaskWorkflowValue(taskId, fieldId, next);
  }

  function removePersonFromWorkflow(taskId: string, fieldId: string, token: string) {
    const currentRaw = currentResponse.taskForms[taskId]?.workflowValues?.[fieldId] ?? '';
    const next = parsePeopleValue(currentRaw)
      .filter((entry) => entry !== token)
      .join('; ');
    updateTaskWorkflowValue(taskId, fieldId, next);
  }

  function matchingIcamPeople(query: string): IcamPerson[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return DUMMY_ICAM_DIRECTORY.slice(0, 6);
    }
    return DUMMY_ICAM_DIRECTORY.filter((person) =>
      `${person.displayName} ${person.email} ${person.roleTitle} ${person.organization}`
        .toLowerCase()
        .includes(normalized),
    ).slice(0, 8);
  }

  useEffect(() => {
    const suggestions = buildSuggestedResponse(currentDomainIndex);
    setDomainResponses((existing) => {
      const current = existing[currentDomain.id];
      if (
        current &&
        current.objective.trim() &&
        current.roleNote.trim() &&
        current.policyRisk.trim()
      ) {
        return existing;
      }
      return {
        ...existing,
        [currentDomain.id]: {
          objective: current?.objective?.trim() ? current.objective : suggestions.objective,
          roleNote: current?.roleNote?.trim() ? current.roleNote : suggestions.roleNote,
          policyRisk: current?.policyRisk?.trim() ? current.policyRisk : suggestions.policyRisk,
          checklistComplete:
            current?.checklistComplete ??
            allPrimaryTasksComplete(
              {
                objective: current?.objective ?? '',
                roleNote: current?.roleNote ?? '',
                policyRisk: current?.policyRisk ?? '',
                checklistComplete: false,
                artifactComplete: current?.artifactComplete ?? false,
                serviceComplete: current?.serviceComplete ?? false,
                taskStatus: current?.taskStatus ?? {},
                taskForms: current?.taskForms ?? {},
              },
              currentDomain.id,
            ),
          artifactComplete: current?.artifactComplete ?? false,
          serviceComplete: current?.serviceComplete ?? false,
          taskStatus: current?.taskStatus ?? {},
          taskForms: current?.taskForms ?? {},
        },
      };
    });
  }, [currentDomain.id, currentDomainIndex, role, projectName, domainResponses, regAnchorSignature]);

  async function runAction(action: () => Promise<unknown>) {
    setBusy(true);
    try {
      const payload = await action();
      setOutput(JSON.stringify(payload, null, 2));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      const networkHint =
        /fetch|network|Failed to fetch|Load failed|ECONNREFUSED/i.test(message) ||
        message.includes('Federal Register') ||
        message.includes('eCFR')
          ? 'External API tip: confirm your network allows HTTPS to federalregister.gov and ecfr.gov, relax optional agency filters, or retry later.'
          : undefined;
      setOutput(JSON.stringify({error: message, ...(networkHint ? {hint: networkHint} : {})}, null, 2));
    } finally {
      setBusy(false);
    }
  }

  async function runLocal(path: string, method: string, body: Record<string, unknown>, activeToken: string | null) {
    const state = getLocalState();

    function parseLocalToken(raw: string | null): {userId: string; role: string} | null {
      if (!raw) {
        return null;
      }
      try {
        const decoded = atob(raw);
        const [userId, roleFromToken] = decoded.split(':');
        return {userId, role: roleFromToken};
      } catch {
        return null;
      }
    }

    function audit(eventType: string, actorId: string, payload: Record<string, unknown>) {
      state.auditEvents.push({
        id: `audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        eventType,
        actorId,
        payload,
        timestamp: new Date().toISOString(),
      });
    }

    if (method === 'GET' && path === '/health') {
      return {status: 'ok', service: 'iaf-demo-browser-only', mode: 'localStorage'};
    }

    if (method === 'POST' && path === '/auth/login') {
      const localEmail = String(body.email ?? '').toLowerCase().trim();
      const localRole = String(body.role ?? 'program_manager') as Role;
      if (!localEmail) {
        throw new Error('email is required');
      }
      let user = state.users.find((candidate) => candidate.email === localEmail);
      if (!user) {
        user = {
          userId: `user-${Date.now()}`,
          email: localEmail,
          role: localRole,
        };
        state.users.push(user);
        audit('user_created', user.userId, {email: localEmail, role: localRole});
      }
      const issuedToken = btoa(`${user.userId}:${user.role}`);
      setLocalState(state);
      return {token: issuedToken, user};
    }

    const session = parseLocalToken(activeToken);
    if (!session) {
      throw new Error('Unauthorized');
    }

    if (method === 'POST' && path === '/projects') {
      const name = String(body.name ?? '').trim();
      if (!name) {
        throw new Error('name is required');
      }
      const project = {
        id: `project-${Date.now()}`,
        name,
        description: String(body.description ?? ''),
        ownerId: session.userId,
        currentDomain: 'domain-1-framing',
        createdAt: new Date().toISOString(),
      };
      state.projects.push(project);
      audit('project_created', session.userId, {projectId: project.id, name: project.name});
      setLocalState(state);
      return {project};
    }

    if (method === 'POST' && path.match(/^\/projects\/[^/]+\/artifacts$/)) {
      const projectPathId = path.split('/')[2];
      const artifact = {
        id: `artifact-${Date.now()}`,
        projectId: projectPathId,
        templateId: String(body.templateId ?? ''),
        title: String(body.title ?? 'Untitled Artifact'),
        markdown: String(body.markdown ?? ''),
        status: 'draft',
        ownerId: session.userId,
        version: 1,
        updatedAt: new Date().toISOString(),
      };
      state.artifacts.push(artifact);
      audit('artifact_created', session.userId, {projectId: projectPathId, artifactId: artifact.id});
      setLocalState(state);
      return {artifact};
    }

    if (method === 'POST' && path.match(/^\/projects\/[^/]+\/services$/)) {
      const projectPathId = path.split('/')[2];
      const serviceRequest = {
        id: `service-${Date.now()}`,
        projectId: projectPathId,
        serviceId: String(body.serviceId ?? ''),
        status: 'submitted',
        requestedBy: session.userId,
        createdAt: new Date().toISOString(),
        outputArtifactIds: [],
      };
      state.serviceRequests.push(serviceRequest);
      audit('service_requested', session.userId, {projectId: projectPathId, serviceId: serviceRequest.serviceId});
      setLocalState(state);
      return {serviceRequest};
    }

    if (method === 'GET' && path.match(/^\/projects\/[^/]+\/dashboard$/)) {
      const projectPathId = path.split('/')[2];
      const project = state.projects.find((candidate) => candidate.id === projectPathId);
      if (!project) {
        throw new Error('project not found');
      }
      const artifacts = state.artifacts.filter((artifact) => artifact.projectId === projectPathId);
      const serviceRequests = state.serviceRequests.filter((item) => item.projectId === projectPathId);
      return {
        project,
        summary: {
          artifactCount: artifacts.length,
          serviceRequestCount: serviceRequests.length,
          pendingApprovals: artifacts.filter((artifact) => artifact.status !== 'approved').length,
        },
      };
    }

    if (method === 'GET' && path.match(/^\/projects\/[^/]+\/audit$/)) {
      const projectPathId = path.split('/')[2];
      return {
        events: state.auditEvents.filter(
          (event) => String(event.payload.projectId ?? '') === projectPathId || event.payload.projectId === undefined,
        ),
      };
    }

    throw new Error('Route not found in browser-only mode');
  }

  async function requestData(path: string, method: string, body: Record<string, unknown> = {}) {
    if (browserOnlyMode) {
      return runLocal(path, method, body, token);
    }
    return requestJson(
      apiBaseUrl,
      path,
      {
        method,
        body: method === 'GET' ? undefined : JSON.stringify(body),
      },
      token,
    );
  }

  async function handleLogin() {
    const response = (await requestData('/auth/login', 'POST', {email, role})) as {token?: string};
    if (response.token) {
      setToken(response.token);
      setWizardStep('project');
    }
    return response;
  }

  async function handleCreateProject() {
    setRegContext((existing) => ({
      ...existing,
      frSearchTerm: existing.frSearchTerm.trim() || projectDescription.trim().slice(0, 220),
    }));
    const response = (await requestData('/projects', 'POST', {
      name: projectName,
      description: projectDescription,
    })) as {project?: {id?: string}};
    if (response.project?.id) {
      setProjectId(response.project.id);
      setWizardStep('domain');
    }
    return response;
  }

  async function handleSaveDomain() {
    const primaryTasks = getRolePrimaryTasks(currentDomain.id);
    const supportingTasks = getRoleSupportingTasks(currentDomain.id);
    const projectedResponse: DomainResponse = {
      ...currentResponse,
      artifactComplete: true,
      serviceComplete: true,
    };
    const standardsChecks = getDomainStandardChecks(projectedResponse, currentDomain.id);
    const artifactPayload = await requestData(`/projects/${projectId}/artifacts`, 'POST', {
      templateId: currentDomain.templateId,
      title: `${currentDomain.label} Artifact`,
      markdown:
        `# ${currentDomain.label}\n\n` +
        `## Role workflow (${role})\n` +
        `Primary tasks: ${primaryTasks.length ? primaryTasks.join(', ') : 'none assigned'}\n\n` +
        `Supporting tasks: ${supportingTasks.length ? supportingTasks.join(', ') : 'none assigned'}\n\n` +
        `## Objective\n${currentResponse.objective}\n\n` +
        `## Role-specific note (${role})\n${currentResponse.roleNote}\n\n` +
        `## Task completion status\n${Object.entries(currentResponse.taskStatus)
          .map(([taskId, done]) => `- ${taskId}: ${done ? 'complete' : 'incomplete'}`)
          .join('\n')}\n\n` +
        `## Task workflow form data\n${Object.entries(currentResponse.taskForms)
          .map(
            ([taskId, form]) =>
              `- ${taskId}: workflow=${JSON.stringify(form.workflowValues ?? {})}`,
          )
          .join('\n')}\n\n` +
        `## Domain standards alignment control\n` +
        `${standardsChecks.map((check) => `- ${check.complete ? '[x]' : '[ ]'} ${check.label}`).join('\n')}\n\n` +
        `## Policy / regulation\n${DOMAIN_STANDARD_REQUIREMENTS[currentDomain.id].policyReference}\n\n` +
        `## Governance gate objective\n${DOMAIN_STANDARD_REQUIREMENTS[currentDomain.id].governanceGateObjective}\n\n` +
        (regContext.anchors.length
          ? `## Regulatory anchors (Federal Register / eCFR)\n${regContext.anchors
              .map((anchor) => `- [${anchor.title}](${anchor.url}) (${anchor.source})`)
              .join('\n')}\n\n`
          : '') +
        `## Policy / risk note\n${currentResponse.policyRisk}\n`,
    });

    const servicePayload = await requestData(`/projects/${projectId}/services`, 'POST', {
      serviceId: currentDomain.serviceId,
    });

    updateCurrentResponse({
      artifactComplete: true,
      serviceComplete: true,
      checklistComplete: allPrimaryTasksComplete(currentResponse, currentDomain.id),
    });

    return {
      domain: currentDomain.label,
      artifact: artifactPayload,
      service: servicePayload,
    };
  }

  function canAdvanceDomain(): boolean {
    const primaryTasks = getRolePrimaryTasks(currentDomain.id);
    return Boolean(
      primaryTasks.length &&
        areDomainStandardsSatisfied(currentResponse, currentDomain.id),
    );
  }

  function goNextDomain() {
    if (currentDomainIndex < DOMAIN_STEPS.length - 1) {
      setCurrentDomainIndex((index) => index + 1);
      return;
    }
    setWizardStep('summary');
  }

  function goPreviousDomain() {
    if (currentDomainIndex > 0) {
      setCurrentDomainIndex((index) => index - 1);
    }
  }

  function renderDemoWizardProgress(): React.JSX.Element {
    const signInComplete = Boolean(token);
    const signInActive = !token && (wizardStep === 'connection' || wizardStep === 'login');
    const projectComplete = Boolean(projectId) && wizardStep !== 'project';
    const projectActive = Boolean(token) && wizardStep === 'project';
    const domainsActive = wizardStep === 'domain';
    const domainsComplete = wizardStep === 'summary';
    const summaryActive = wizardStep === 'summary';
    const domainStepLabel =
      wizardStep === 'domain'
        ? `Domains (${currentDomainIndex + 1}/7)`
        : wizardStep === 'summary'
          ? 'Domains (done)'
          : 'Domains';

    function segmentState(complete: boolean, active: boolean): string {
      if (complete) {
        return 'iaf-demo-wizard-progress__segment--complete';
      }
      if (active) {
        return 'iaf-demo-wizard-progress__segment--active';
      }
      return 'iaf-demo-wizard-progress__segment--pending';
    }

    return (
      <nav className="iaf-demo-wizard-progress" aria-label="Interactive demo progress">
        <ol className="iaf-demo-wizard-progress__list">
          <li
            className={`iaf-demo-wizard-progress__segment ${segmentState(signInComplete, signInActive)}`}
            aria-current={signInActive ? 'step' : undefined}>
            <span className="iaf-demo-wizard-progress__label">1. Sign in</span>
          </li>
          <li
            className={`iaf-demo-wizard-progress__segment ${segmentState(projectComplete, projectActive)}`}
            aria-current={projectActive ? 'step' : undefined}>
            <span className="iaf-demo-wizard-progress__label">2. Project setup</span>
          </li>
          <li
            className={`iaf-demo-wizard-progress__segment ${segmentState(domainsComplete, domainsActive)}`}
            aria-current={domainsActive ? 'step' : undefined}>
            <span className="iaf-demo-wizard-progress__label">3. {domainStepLabel}</span>
          </li>
          <li
            className={`iaf-demo-wizard-progress__segment ${segmentState(false, summaryActive)}`}
            aria-current={summaryActive ? 'step' : undefined}>
            <span className="iaf-demo-wizard-progress__label">4. Wrap-up</span>
          </li>
        </ol>
      </nav>
    );
  }

  return (
    <div>
      {renderDemoWizardProgress()}
      <div style={containerStyle}>
        <h3>Demo Mode</h3>
        <label htmlFor="browserOnlyMode">
          <input
            id="browserOnlyMode"
            type="checkbox"
            checked={browserOnlyMode}
            onChange={(event) => setBrowserOnlyMode(event.target.checked)}
          />{' '}
          Browser-only mode (no backend process required)
        </label>
        <FieldLabel
          htmlFor="apiBaseUrl"
          label="API Base URL (used only when browser-only mode is off)"
          helpText="Enter the backend API origin URL, for example http://localhost:4100. This value is ignored when browser-only mode is enabled."
        />
        <input
          id="apiBaseUrl"
          style={inputStyle}
          value={apiBaseUrl}
          onChange={(event) => setApiBaseUrl(event.target.value)}
          disabled={browserOnlyMode}
        />
        <button
          type="button"
          className="button button--secondary"
          disabled={busy}
          onClick={() => runAction(() => requestData('/health', 'GET'))}>
          {browserOnlyMode ? 'Check Browser Demo State' : 'Check API Health'}
        </button>
        <div className="margin-top--md">
          <FieldLabel
            htmlFor="icamMode"
            label="ICAM / Personnel Connection"
            helpText="Select how people fields are populated: demo directory lookup or manual free-text entry."
          />
          <select
            id="icamMode"
            style={inputStyle}
            value={icamMode}
            onChange={(event) => setIcamMode(event.target.value as 'dummy' | 'manual')}>
            <option value="dummy">Dummy ICAM directory (demo)</option>
            <option value="manual">Manual entry only</option>
          </select>
          <p className="margin-bottom--none">
            {icamMode === 'dummy'
              ? 'Dummy ICAM is active: stakeholder fields support live search by name/email.'
              : 'Manual mode is active: stakeholder fields accept free text input only.'}
          </p>
        </div>
        <div className="margin-top--md">
          <h4>Master Role List Control</h4>
          <p className="margin-bottom--xs">
            Canonical roles: {masterRoleKeys.map((roleKey) => `${roleLabel(roleKey)} (${MASTER_ROLES[roleKey].shortCode})`).join('; ')}
          </p>
          {roleConsistencyChecks.map((check) => (
            <div key={check.id}>
              <code>{check.complete ? 'pass' : 'fail'}</code> {check.label}
            </div>
          ))}
        </div>
      </div>

      {wizardStep === 'connection' || wizardStep === 'login' ? (
        <div style={containerStyle}>
          <h3>Step 1: Login</h3>
          <p>The rest of the experience adapts to the role chosen here.</p>
          <FieldLabel
            htmlFor="email"
            label="Email"
            helpText="Enter your work email. The hub uses this to sign in and infer your agency during project setup."
          />
          <input
            id="email"
            style={inputStyle}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <FieldLabel
            htmlFor="role"
            label="Role"
            helpText="Choose your TDSP-aligned role (Group Manager, Team Lead, Project Lead, Data Scientist, DevOps Engineer, Application Developer, Data Engineer, or Platform Admin). Task emphasis and prompts follow the Task RACI Matrix."
          />
          <select
            id="role"
            style={inputStyle}
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}>
            {masterRoleKeys.map((roleKey) => (
              <option key={roleKey} value={roleKey}>
                {roleLabel(roleKey)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button button--primary"
            disabled={busy}
            onClick={() => runAction(handleLogin)}>
            Continue
          </button>
          <p>
            <strong>Token:</strong> <code>{tokenPreview}</code>
          </p>
        </div>
      ) : null}

      {wizardStep === 'project' ? (
        <div style={containerStyle}>
          <h3>Step 2: Project Setup</h3>
          <FieldLabel
            htmlFor="projectName"
            label="Project Name"
            helpText="Enter a short, descriptive title for the initiative. This appears across generated artifacts and the summary."
          />
          <input
            id="projectName"
            style={inputStyle}
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
          <FieldLabel
            htmlFor="projectDescription"
            label="Project Description"
            helpText="Describe the mission problem, intended outcome, and operating constraints. This seeds suggestions in downstream workflow steps."
          />
          <textarea
            id="projectDescription"
            style={{...inputStyle, minHeight: '90px'}}
            value={projectDescription}
            onChange={(event) => setProjectDescription(event.target.value)}
          />

          <hr style={{margin: '1.25rem 0'}} />
          <h4 className="margin-bottom--xs">Optional: Regulatory context (Federal Register &amp; eCFR)</h4>
          <p style={{fontSize: '0.9rem'}} className="margin-bottom--sm">
            Pull live metadata from the public{' '}
            <a href="https://www.federalregister.gov/reader-aids/developer-resources/rest-api" target="_blank" rel="noreferrer">
              Federal Register API
            </a>{' '}
            and browse links from the public{' '}
            <a href="https://www.ecfr.gov/reader-aids/ecfr-developer-resources" target="_blank" rel="noreferrer">
              eCFR API
            </a>
            . Suggestions are not legal advice—confirm each anchor applies to your initiative.
          </p>
          <FieldLabel
            htmlFor="frSearchTerm"
            label="Federal Register search terms"
            helpText="Enter key terms used to retrieve relevant Federal Register documents, such as program names, policy topics, or compliance keywords."
          />
          <input
            id="frSearchTerm"
            style={inputStyle}
            value={regContext.frSearchTerm}
            onChange={(event) => setRegContext((existing) => ({...existing, frSearchTerm: event.target.value}))}
            placeholder="e.g., permitting, artificial intelligence, data quality"
          />
          <div className="margin-top--sm margin-bottom--sm">
            <button
              type="button"
              className="button button--secondary margin-right--sm"
              disabled={frAgenciesBusy}
              onClick={() => {
                void ensureFrAgencies();
              }}>
              {frAgenciesBusy ? 'Loading agencies…' : 'Load publishing agencies'}
            </button>
            <span style={{fontSize: '0.85rem'}}>Loads the first 500 agencies for filtering (demo scope).</span>
          </div>
          {frAgencies.length ? (
            <>
              <FieldLabel
                htmlFor="frAgencyFilter"
                label="Filter agency list"
                helpText="Type part of an agency name to narrow the publishing agency options."
              />
              <input
                id="frAgencyFilter"
                style={inputStyle}
                value={frAgencyFilter}
                onChange={(event) => setFrAgencyFilter(event.target.value)}
                placeholder="Type to filter by agency name"
              />
              <FieldLabel
                htmlFor="frAgencySelect"
                label="Publishing agency (optional)"
                helpText="Choose the Federal Register publishing agency to narrow regulatory search results. Leave blank to search across all agencies."
              />
              <select
                id="frAgencySelect"
                style={inputStyle}
                value={regContext.frAgencyId ?? ''}
                onChange={(event) =>
                  setRegContext((existing) => ({
                    ...existing,
                    frAgencyId: event.target.value ? Number(event.target.value) : null,
                  }))
                }>
                <option value="">All agencies (no agency filter)</option>
                {filteredFrAgencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
              <p style={{fontSize: '0.8rem', marginTop: '0.35rem'}}>
                {selectedFrAgency
                  ? `Agency auto-identified from your login email: ${selectedFrAgency.name}.`
                  : 'Agency could not be auto-identified from your login email; choose one if desired.'}
              </p>
            </>
          ) : null}
          <div className="margin-top--sm margin-bottom--sm">
            <button
              type="button"
              className="button button--secondary margin-right--sm"
              disabled={frQueryBusy}
              onClick={() => {
                void runFrDocumentSearch();
              }}>
              {frQueryBusy ? 'Searching…' : 'Suggest Federal Register documents'}
            </button>
          </div>
          {frResults.length ? (
            <div className="margin-bottom--md">
              <strong>Suggestions</strong>
              {frResults.map((hit) => (
                <div
                  key={hit.documentNumber}
                  style={{
                    border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '6px',
                    padding: '0.6rem',
                    marginTop: '0.5rem',
                  }}>
                  <div style={{fontWeight: 600}}>{hit.title}</div>
                  <div style={{fontSize: '0.85rem', marginTop: '0.25rem'}}>
                    {hit.publicationDate ? `${hit.publicationDate} · ` : ''}
                    {hit.abstract ? `${hit.abstract.slice(0, 220)}${hit.abstract.length > 220 ? '…' : ''}` : 'No abstract.'}
                  </div>
                  <div className="margin-top--sm">
                    <button
                      type="button"
                      className="button button--secondary button--sm margin-right--sm"
                      onClick={() => addRegulatoryAnchor(createFrAnchor(hit))}>
                      Add as anchor
                    </button>
                    <a href={hit.htmlUrl} target="_blank" rel="noreferrer">
                      Open document
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="margin-bottom--sm">
            <button
              type="button"
              className="button button--secondary margin-right--sm"
              disabled={ecfrBusy}
              onClick={() => {
                void ensureEcfrTitles();
              }}>
              {ecfrBusy ? 'Loading CFR titles…' : 'Load eCFR titles'}
            </button>
            {ecfrTitles?.length ? (
              <>
                <FieldLabel
                  htmlFor="ecfrTitleSelect"
                  className="margin-left--sm"
                  label="Add CFR title anchor"
                  helpText="Select a CFR title to add a reusable regulatory anchor for this initiative."
                />
                <select
                  id="ecfrTitleSelect"
                  style={{...inputStyle, maxWidth: '100%'}}
                  value={ecfrTitlePick === '' ? '' : String(ecfrTitlePick)}
                  onChange={(event) =>
                    setEcfrTitlePick(event.target.value ? Number(event.target.value) : '')
                  }>
                  <option value="">Select a title…</option>
                  {ecfrTitles.map((titleRow) => (
                    <option key={titleRow.number} value={titleRow.number}>
                      Title {titleRow.number}: {titleRow.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="button button--secondary margin-left--sm"
                  disabled={ecfrTitlePick === ''}
                  onClick={() => {
                    if (ecfrTitlePick === '') {
                      return;
                    }
                    const row = ecfrTitles.find((titleRow) => titleRow.number === ecfrTitlePick);
                    if (row) {
                      addRegulatoryAnchor(createEcfrTitleAnchor(row));
                    }
                    setEcfrTitlePick('');
                  }}>
                  Add title anchor
                </button>
              </>
            ) : null}
          </div>

          {regContext.anchors.length ? (
            <div className="margin-bottom--md">
              <strong>Confirmed anchors ({regContext.anchors.length})</strong>
              <ul>
                {regContext.anchors.map((anchor) => (
                  <li key={anchor.id}>
                    <a href={anchor.url} target="_blank" rel="noreferrer">
                      {anchor.title}
                    </a>{' '}
                    <button
                      type="button"
                      className="button button--sm button--secondary"
                      onClick={() => removeRegulatoryAnchor(anchor.id)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {projectId ? (
            <button type="button" className="button button--primary" onClick={() => setWizardStep('domain')}>
              Continue to domain workflow
            </button>
          ) : (
            <button
              type="button"
              className="button button--primary"
              disabled={busy}
              onClick={() => runAction(handleCreateProject)}>
              Start Domain Workflow
            </button>
          )}
          <p>
            <strong>Project ID:</strong> <code>{projectId || 'Not created yet.'}</code>
          </p>
        </div>
      ) : null}

      {wizardStep === 'domain' ? (
        <div style={containerStyle}>
          <h3>
            Step 3: Domain Workflow ({currentDomainIndex + 1}/7)
          </h3>
          <p>
            <strong>{currentDomain.label}</strong>
          </p>
          {getIafDomainDefinition(currentDomain.id)?.docFileStem ? (
            <p className="margin-bottom--sm">
              <a
                href={`${domainDocsBase}${getIafDomainDefinition(currentDomain.id)?.docFileStem}`}
                target="_blank"
                rel="noreferrer">
                Open matching Domain Standard (documentation)
              </a>
            </p>
          ) : null}
          {regulatoryNudgeForDomain(currentDomain.id) ? (
            <div
              className="margin-bottom--md"
              style={{
                borderLeft: '4px solid var(--ifm-color-primary)',
                paddingLeft: '0.75rem',
              }}>
              <strong>Regulatory context</strong>
              <pre style={{whiteSpace: 'pre-wrap', margin: '0.5rem 0 0', fontFamily: 'inherit', fontSize: '0.9rem'}}>
                {regulatoryNudgeForDomain(currentDomain.id)}
              </pre>
            </div>
          ) : null}
          <div className="margin-bottom--md">
            <strong>Confirmed regulatory anchors</strong>
            {regContext.anchors.length ? (
              <ul className="margin-bottom--none">
                {regContext.anchors.map((anchor) => (
                  <li key={anchor.id}>
                    <a href={anchor.url} target="_blank" rel="noreferrer">
                      {anchor.title}
                    </a>{' '}
                    <button
                      type="button"
                      className="button button--sm button--secondary"
                      onClick={() => removeRegulatoryAnchor(anchor.id)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="margin-bottom--sm" style={{fontSize: '0.9rem'}}>
                None yet. You can add anchors from Project Setup, or continue without external citations.
              </p>
            )}
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={() => setWizardStep('project')}>
              Adjust regulatory anchors (return to project setup)
            </button>
          </div>
          <p>
            <strong>IAF tasks in this domain:</strong> {renderTaskLinks(currentTaskProfile.allTasks)}
          </p>
          <p>
            <strong>{roleLabel(role)} primary tasks:</strong>{' '}
            {currentRoleTaskFocus?.primary?.length
              ? renderTaskLinks(currentRoleTaskFocus.primary)
              : 'No explicit primary tasks assigned in this placeholder matrix.'}
          </p>
          <p>
            <strong>{roleLabel(role)} supporting tasks:</strong>{' '}
            {currentRoleTaskFocus?.supporting?.length
              ? renderTaskLinks(currentRoleTaskFocus.supporting)
              : 'No explicit supporting tasks assigned in this placeholder matrix.'}
          </p>
          <p>
            <strong>Domain gate rule:</strong> all primary tasks for the selected role must be marked complete
            before advancing.
          </p>
          <div className="margin-bottom--sm">
            <strong>Domain Standards Control</strong>
            <p className="margin-bottom--xs">
              <strong>Exit criteria:</strong> {DOMAIN_STANDARD_REQUIREMENTS[currentDomain.id].exitCriteria}
            </p>
            <p className="margin-bottom--xs">
              <strong>Policy / Regulation:</strong> {DOMAIN_STANDARD_REQUIREMENTS[currentDomain.id].policyReference}
            </p>
            <p className="margin-bottom--xs">
              <strong>Governance gate objective:</strong>{' '}
              {DOMAIN_STANDARD_REQUIREMENTS[currentDomain.id].governanceGateObjective}
            </p>
            <p className="margin-bottom--xs">
              <strong>Required artifacts:</strong>{' '}
              {DOMAIN_STANDARD_REQUIREMENTS[currentDomain.id].requiredArtifacts.join('; ')}
            </p>
            {getDomainStandardChecks(currentResponse, currentDomain.id).map((check) => (
              <div key={check.id}>
                <code>{check.complete ? 'pass' : 'pending'}</code> {check.label}
              </div>
            ))}
          </div>
          <p>
            <strong>Prior domain context:</strong> {previousDomainSummary()}
          </p>

          <FieldLabel
            htmlFor="objective"
            label={currentDomain.objectiveLabel}
            helpText="Enter the domain outcome statement your team is committing to in this stage."
          />
          <textarea
            id="objective"
            style={{...inputStyle, minHeight: '80px'}}
            value={currentResponse.objective}
            onChange={(event) => updateCurrentResponse({objective: event.target.value})}
          />
          <button
            type="button"
            className="button button--secondary button--sm margin-bottom--sm"
            onClick={() => updateCurrentResponse({objective: generateDomainFieldExample('objective')})}>
            Generate Example
          </button>

          <FieldLabel
            htmlFor="roleNote"
            label={`Role-specific note (${role})`}
            helpText="Capture what this role must deliver or validate in this domain to satisfy governance and execution expectations."
          />
          <p>{ROLE_PROMPTS[role]}</p>
          <textarea
            id="roleNote"
            style={{...inputStyle, minHeight: '80px'}}
            value={currentResponse.roleNote}
            onChange={(event) => updateCurrentResponse({roleNote: event.target.value})}
          />
          <button
            type="button"
            className="button button--secondary button--sm margin-bottom--sm"
            onClick={() => updateCurrentResponse({roleNote: generateDomainFieldExample('roleNote')})}>
            Generate Example
          </button>

          <FieldLabel
            htmlFor="policyRisk"
            label="Policy and risk note"
            helpText="Document policy, legal, privacy, security, or operational risks and how they will be mitigated."
          />
          <textarea
            id="policyRisk"
            style={{...inputStyle, minHeight: '80px'}}
            value={currentResponse.policyRisk}
            onChange={(event) => updateCurrentResponse({policyRisk: event.target.value})}
          />
          <button
            type="button"
            className="button button--secondary button--sm margin-bottom--sm"
            onClick={() => updateCurrentResponse({policyRisk: generateDomainFieldExample('policyRisk')})}>
            Generate Example
          </button>

          <div className="margin-bottom--sm">
            <strong>Role Task Workflow</strong>
          </div>
          {currentRoleTaskFocus?.primary?.length ? (
            <div className="margin-bottom--sm">
              <p className="margin-bottom--xs">
                <strong>Primary tasks (required):</strong>
              </p>
              {currentRoleTaskFocus.primary.map((taskId) => (
                <div
                  key={taskId}
                  style={{
                    border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                  }}>
                  <p className="margin-bottom--xs">
                    <strong>Task:</strong>{' '}
                    <a
                      href={taskReferenceLink(taskId)}
                      target="_blank"
                      rel="noreferrer"
                      title={taskTooltip(taskId)}>
                      {taskId}
                    </a>
                  </p>
                  <div className="margin-bottom--sm">
                    <p className="margin-bottom--xs">
                      <strong>Workflow:</strong> {getTaskWorkflowDefinition(taskId).summary}
                    </p>
                    {getTaskWorkflowDefinition(taskId).fields.map((field) => {
                        const value = currentResponse.taskForms[taskId]?.workflowValues?.[field.id] ?? '';
                        if (field.type === 'textarea') {
                          return (
                            <label key={field.id} style={{display: 'block'}}>
                              {field.label}{' '}
                              <span title={field.helpText ?? 'Provide the required task workflow information.'}>ⓘ</span>
                              <textarea
                                style={{...inputStyle, minHeight: '64px'}}
                                value={value}
                                placeholder={field.placeholder}
                                onChange={(event) => updateTaskWorkflowValue(taskId, field.id, event.target.value)}
                              />
                              <button
                                type="button"
                                className="button button--secondary button--sm margin-bottom--sm"
                                onClick={() =>
                                  updateTaskWorkflowValue(taskId, field.id, generateWorkflowFieldExample(taskId, field))
                                }>
                                Generate Example
                              </button>
                            </label>
                          );
                        }
                        if (field.type === 'select') {
                          return (
                            <label key={field.id} style={{display: 'block'}}>
                              {field.label}{' '}
                              <span title={field.helpText ?? 'Select the option that best matches this task step.'}>ⓘ</span>
                              <select
                                style={inputStyle}
                                value={value}
                                onChange={(event) => updateTaskWorkflowValue(taskId, field.id, event.target.value)}>
                                <option value="">Select an option</option>
                                {(field.options ?? []).map((optionValue) => (
                                  <option key={optionValue} value={optionValue}>
                                    {optionValue}
                                  </option>
                                ))}
                              </select>
                            </label>
                          );
                        }
                        if (field.type === 'people') {
                          const searchKey = `${taskId}:${field.id}`;
                          const selectedTokens = parsePeopleValue(value);
                          const searchValue = icamSearchByTask[searchKey] ?? '';
                          return (
                            <div key={field.id} style={{display: 'block', marginBottom: '0.5rem'}}>
                              <label style={{display: 'block'}}>
                                {field.label}{' '}
                                <span title={field.helpText ?? 'Search the directory and select people for this field.'}>
                                  ⓘ
                                </span>
                              </label>
                              {icamMode === 'dummy' ? (
                                <>
                                  <input
                                    style={inputStyle}
                                    placeholder={field.placeholder}
                                    value={searchValue}
                                    onChange={(event) =>
                                      setIcamSearchByTask((existing) => ({
                                        ...existing,
                                        [searchKey]: event.target.value,
                                      }))
                                    }
                                  />
                                  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '6px', padding: '0.5rem', marginBottom: '0.5rem'}}>
                                    {matchingIcamPeople(searchValue).map((person) => (
                                      <button
                                        key={person.id}
                                        type="button"
                                        className="button button--secondary button--sm margin-right--sm margin-bottom--sm"
                                        onClick={() => addPersonToWorkflow(taskId, field.id, person)}>
                                        Add {person.displayName} ({person.email})
                                      </button>
                                    ))}
                                  </div>
                                </>
                              ) : null}
                              <textarea
                                style={{...inputStyle, minHeight: '64px'}}
                                value={value}
                                placeholder={
                                  icamMode === 'dummy'
                                    ? 'Selected stakeholders will appear here.'
                                    : field.placeholder
                                }
                                onChange={(event) => updateTaskWorkflowValue(taskId, field.id, event.target.value)}
                              />
                              {selectedTokens.length ? (
                                <div>
                                  {selectedTokens.map((token) => (
                                    <button
                                      key={token}
                                      type="button"
                                      className="button button--secondary button--sm margin-right--sm margin-bottom--sm"
                                      onClick={() => removePersonFromWorkflow(taskId, field.id, token)}>
                                      Remove {token}
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          );
                        }
                        return (
                          <label key={field.id} style={{display: 'block'}}>
                            {field.label}{' '}
                            <span title={field.helpText ?? 'Provide the required task workflow information.'}>ⓘ</span>
                            <input
                              style={inputStyle}
                              value={value}
                              placeholder={field.placeholder}
                              onChange={(event) => updateTaskWorkflowValue(taskId, field.id, event.target.value)}
                            />
                          </label>
                        );
                      })}
                  </div>
                  <p className="margin-bottom--none">
                    <strong>Task complete:</strong> <code>{String(Boolean(currentResponse.taskStatus[taskId]))}</code>
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          {currentRoleTaskFocus?.supporting?.length ? (
            <div className="margin-bottom--sm">
              <p className="margin-bottom--xs">
                <strong>Supporting tasks:</strong>
              </p>
              {currentRoleTaskFocus.supporting.map((taskId) => (
                <div
                  key={taskId}
                  style={{
                    border: '1px dashed var(--ifm-color-emphasis-300)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                  }}>
                  <strong>Task:</strong>{' '}
                  <a
                    href={taskReferenceLink(taskId)}
                    target="_blank"
                    rel="noreferrer"
                    title={taskTooltip(taskId)}>
                    {taskId}
                  </a>
                  <p className="margin-top--xs margin-bottom--sm">
                    <strong>Workflow:</strong> {getTaskWorkflowDefinition(taskId).summary}
                  </p>
                  {getTaskWorkflowDefinition(taskId).fields.map((field) => {
                    const value = currentResponse.taskForms[taskId]?.workflowValues?.[field.id] ?? '';
                    if (field.type === 'textarea') {
                      return (
                        <label key={field.id} style={{display: 'block'}}>
                          {field.label}{' '}
                          <span title={field.helpText ?? 'Provide the required task workflow information.'}>ⓘ</span>
                          <textarea
                            style={{...inputStyle, minHeight: '64px'}}
                            value={value}
                            placeholder={field.placeholder}
                            onChange={(event) => updateTaskWorkflowValue(taskId, field.id, event.target.value)}
                          />
                          <button
                            type="button"
                            className="button button--secondary button--sm margin-bottom--sm"
                            onClick={() =>
                              updateTaskWorkflowValue(taskId, field.id, generateWorkflowFieldExample(taskId, field))
                            }>
                            Generate Example
                          </button>
                        </label>
                      );
                    }
                    if (field.type === 'select') {
                      return (
                        <label key={field.id} style={{display: 'block'}}>
                          {field.label}{' '}
                          <span title={field.helpText ?? 'Select the option that best matches this task step.'}>ⓘ</span>
                          <select
                            style={inputStyle}
                            value={value}
                            onChange={(event) => updateTaskWorkflowValue(taskId, field.id, event.target.value)}>
                            <option value="">Select an option</option>
                            {(field.options ?? []).map((optionValue) => (
                              <option key={optionValue} value={optionValue}>
                                {optionValue}
                              </option>
                            ))}
                          </select>
                        </label>
                      );
                    }
                    if (field.type === 'people') {
                      const searchKey = `${taskId}:${field.id}`;
                      const selectedTokens = parsePeopleValue(value);
                      const searchValue = icamSearchByTask[searchKey] ?? '';
                      return (
                        <div key={field.id} style={{display: 'block', marginBottom: '0.5rem'}}>
                          <label style={{display: 'block'}}>
                            {field.label}{' '}
                            <span title={field.helpText ?? 'Search the directory and select people for this field.'}>
                              ⓘ
                            </span>
                          </label>
                          {icamMode === 'dummy' ? (
                            <>
                              <input
                                style={inputStyle}
                                placeholder={field.placeholder}
                                value={searchValue}
                                onChange={(event) =>
                                  setIcamSearchByTask((existing) => ({
                                    ...existing,
                                    [searchKey]: event.target.value,
                                  }))
                                }
                              />
                              <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '6px', padding: '0.5rem', marginBottom: '0.5rem'}}>
                                {matchingIcamPeople(searchValue).map((person) => (
                                  <button
                                    key={person.id}
                                    type="button"
                                    className="button button--secondary button--sm margin-right--sm margin-bottom--sm"
                                    onClick={() => addPersonToWorkflow(taskId, field.id, person)}>
                                    Add {person.displayName} ({person.email})
                                  </button>
                                ))}
                              </div>
                            </>
                          ) : null}
                          <textarea
                            style={{...inputStyle, minHeight: '64px'}}
                            value={value}
                            placeholder={
                              icamMode === 'dummy' ? 'Selected stakeholders will appear here.' : field.placeholder
                            }
                            onChange={(event) => updateTaskWorkflowValue(taskId, field.id, event.target.value)}
                          />
                          {selectedTokens.length ? (
                            <div>
                              {selectedTokens.map((token) => (
                                <button
                                  key={token}
                                  type="button"
                                  className="button button--secondary button--sm margin-right--sm margin-bottom--sm"
                                  onClick={() => removePersonFromWorkflow(taskId, field.id, token)}>
                                  Remove {token}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    }
                    return (
                      <label key={field.id} style={{display: 'block'}}>
                        {field.label}{' '}
                        <span title={field.helpText ?? 'Provide the required task workflow information.'}>ⓘ</span>
                        <input
                          style={inputStyle}
                          value={value}
                          placeholder={field.placeholder}
                          onChange={(event) => updateTaskWorkflowValue(taskId, field.id, event.target.value)}
                        />
                      </label>
                    );
                  })}
                  <p className="margin-bottom--none">
                    <strong>Task complete:</strong> <code>{String(Boolean(currentResponse.taskStatus[taskId]))}</code>
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          <p>
            <strong>Primary task completion:</strong>{' '}
            <code>{String(allPrimaryTasksComplete(currentResponse, currentDomain.id))}</code>
          </p>

          <button
            type="button"
            className="button button--secondary margin-right--sm"
            disabled={busy || !projectId}
            onClick={() => runAction(handleSaveDomain)}>
            Save Domain Artifact + Service
          </button>

          <button
            type="button"
            className="button button--primary margin-right--sm"
            disabled={busy || !canAdvanceDomain()}
            onClick={goNextDomain}>
            {currentDomainIndex === DOMAIN_STEPS.length - 1 ? 'Finish Demo' : 'Advance Domain'}
          </button>

          <button
            type="button"
            className="button button--secondary"
            disabled={busy || currentDomainIndex === 0}
            onClick={goPreviousDomain}>
            Previous Domain
          </button>

          <div className="margin-top--md">
            {DOMAIN_STEPS.map((step, index) => {
              const response = domainResponses[step.id];
              const done = Boolean(
                response?.checklistComplete && response?.artifactComplete && response?.serviceComplete,
              );
              return (
                <div key={step.id}>
                  <strong>
                    {index + 1}. {step.label}
                  </strong>{' '}
                  <code>{done ? 'complete' : 'incomplete'}</code>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {wizardStep === 'summary' ? (
        <div style={containerStyle}>
          <h3>Step 4: Demo Summary</h3>
          <p>
            <strong>All seven domains are complete.</strong>
          </p>
          <button
            type="button"
            className="button button--secondary margin-right--sm"
            disabled={busy || !projectId}
            onClick={() => runAction(() => requestData(`/projects/${projectId}/dashboard`, 'GET'))}>
            Load Dashboard
          </button>
          <button
            type="button"
            className="button button--secondary"
            disabled={busy || !projectId}
            onClick={() => runAction(() => requestData(`/projects/${projectId}/audit`, 'GET'))}>
            Load Audit Events
          </button>
          <button
            type="button"
            className="button button--primary margin-left--sm"
            disabled={busy}
            onClick={() => {
              setWizardStep('domain');
              setCurrentDomainIndex(0);
            }}>
            Review Domain Flow Again
          </button>
          {allDomainsComplete ? (
            <p className="margin-top--sm">Completion status: all domain gates satisfied.</p>
          ) : null}
        </div>
      ) : null}

      <div style={containerStyle}>
        <h3>Response Output</h3>
        <pre style={{margin: 0}}>{output}</pre>
      </div>
    </div>
  );
}
