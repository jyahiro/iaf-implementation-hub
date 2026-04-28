import React, {useEffect, useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

const MASTER_ROLES = {
  sponsor: {label: 'Executive Sponsor', shortCode: 'SP'},
  program_manager: {label: 'Program Manager', shortCode: 'PM'},
  analyst: {label: 'Analyst', shortCode: 'AN'},
  data_engineer: {label: 'Data Engineer', shortCode: 'DE'},
  data_scientist: {label: 'Data Scientist', shortCode: 'DS'},
  data_steward: {label: 'Data Steward', shortCode: 'ST'},
  reviewer: {label: 'Reviewer/Oversight', shortCode: 'RV'},
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
  {id: 'u-001', displayName: 'Avery Johnson', email: 'avery.johnson@agency.gov', roleTitle: 'Program Manager', organization: 'Permitting Office'},
  {id: 'u-002', displayName: 'Jordan Lee', email: 'jordan.lee@agency.gov', roleTitle: 'Data Steward', organization: 'Data Governance Office'},
  {id: 'u-003', displayName: 'Taylor Smith', email: 'taylor.smith@agency.gov', roleTitle: 'Policy Advisor', organization: 'General Counsel'},
  {id: 'u-004', displayName: 'Casey Brown', email: 'casey.brown@agency.gov', roleTitle: 'Operations Lead', organization: 'Regional Operations'},
  {id: 'u-005', displayName: 'Morgan Davis', email: 'morgan.davis@agency.gov', roleTitle: 'Data Engineer', organization: 'Enterprise Data Platform'},
  {id: 'u-006', displayName: 'Riley Patel', email: 'riley.patel@agency.gov', roleTitle: 'Executive Sponsor', organization: 'Mission Directorate'},
  {id: 'u-007', displayName: 'Quinn Wilson', email: 'quinn.wilson@agency.gov', roleTitle: 'Reviewer', organization: 'Independent Oversight'},
  {id: 'u-008', displayName: 'Jamie Garcia', email: 'jamie.garcia@agency.gov', roleTitle: 'Analyst', organization: 'Performance Analytics'},
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
        options: ['Executive Sponsor', 'Program Manager', 'Authorizing Official', 'Review Board'],
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

const DOMAIN_STEPS: DomainStep[] = [
  {
    id: 'domain-1-framing',
    label: 'Domain I: Business Problem (Question) Framing',
    templateId: 'template-domain-1-business-problem-brief',
    serviceId: 'service-01',
    objectiveLabel: 'Business problem and outcomes',
  },
  {
    id: 'domain-2-analytics-framing',
    label: 'Domain II: Analytics Problem Framing',
    templateId: 'template-domain-2-analytics-problem-statement',
    serviceId: 'service-01',
    objectiveLabel: 'Analytics question and success metrics',
  },
  {
    id: 'domain-3-data',
    label: 'Domain III: Data',
    templateId: 'template-domain-3-data-readiness-assessment',
    serviceId: 'service-02',
    objectiveLabel: 'Data readiness and governance controls',
  },
  {
    id: 'domain-4-methodology',
    label: 'Domain IV: Methodology (Approach) Framing',
    templateId: 'template-domain-4-method-selection-record',
    serviceId: 'service-03',
    objectiveLabel: 'Method and architecture selection',
  },
  {
    id: 'domain-5-build',
    label: 'Domain V: Analytics/Model Development',
    templateId: 'template-domain-5-model-validation-report',
    serviceId: 'service-03',
    objectiveLabel: 'Model validation and risk documentation',
  },
  {
    id: 'domain-6-deploy',
    label: 'Domain VI: Deployment',
    templateId: 'template-domain-6-7-operational-lifecycle-review',
    serviceId: 'service-04',
    objectiveLabel: 'Deployment readiness and controls',
  },
  {
    id: 'domain-7-lifecycle',
    label: 'Domain VII: Analytics Solution Lifecycle Management',
    templateId: 'template-domain-6-7-operational-lifecycle-review',
    serviceId: 'service-05',
    objectiveLabel: 'Monitoring, recalibration, and sustainment',
  },
];

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
  sponsor: 'Document the decision authority and approval threshold for this domain.',
  program_manager: 'Document delivery milestones, dependencies, and accountability owners.',
  analyst: 'Document analytic assumptions, method rationale, and validation approach.',
  data_engineer: 'Document data pipeline, metadata, quality, and integration implementation tasks.',
  data_scientist: 'Document modeling strategy, feature rationale, and validation decisions.',
  data_steward: 'Document data governance controls, stewardship responsibilities, and quality risks.',
  reviewer: 'Document oversight criteria and evidence required for gate approval.',
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
  const masterRoleKeys = Object.keys(MASTER_ROLES) as Role[];

  const tokenPreview = useMemo(() => {
    if (!token) {
      return 'No token issued yet.';
    }
    return `${token.slice(0, 24)}...`;
  }, [token]);

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

    return {
      objective: objectiveBase,
      roleNote: roleBase,
      policyRisk: policyBase,
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
    return `Key policy and risk controls for ${currentDomain.label}: document legal basis, approval checkpoints, data handling constraints, and mitigation actions tied to ${projectContext}.`;
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
  }, [currentDomain.id, currentDomainIndex, role, projectName, domainResponses]);

  async function runAction(action: () => Promise<unknown>) {
    setBusy(true);
    try {
      const payload = await action();
      setOutput(JSON.stringify(payload, null, 2));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      setOutput(JSON.stringify({error: message}, null, 2));
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

  return (
    <div>
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
        <label htmlFor="apiBaseUrl">API Base URL (used only when browser-only mode is off)</label>
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
          <label htmlFor="icamMode">ICAM / Personnel Connection</label>
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
          <label htmlFor="email">Email</label>
          <input
            id="email"
            style={inputStyle}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label htmlFor="role">Role</label>
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
          <label htmlFor="projectName">Project Name</label>
          <input
            id="projectName"
            style={inputStyle}
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
          <label htmlFor="projectDescription">Project Description</label>
          <textarea
            id="projectDescription"
            style={{...inputStyle, minHeight: '90px'}}
            value={projectDescription}
            onChange={(event) => setProjectDescription(event.target.value)}
          />
          <button
            type="button"
            className="button button--primary"
            disabled={busy}
            onClick={() => runAction(handleCreateProject)}>
            Start Domain Workflow
          </button>
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

          <label htmlFor="objective">{currentDomain.objectiveLabel}</label>
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

          <label htmlFor="roleNote">Role-specific note ({role})</label>
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

          <label htmlFor="policyRisk">Policy and risk note</label>
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
