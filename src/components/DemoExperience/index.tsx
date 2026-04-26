import React, {useEffect, useMemo, useState} from 'react';

type Role =
  | 'program_manager'
  | 'analyst'
  | 'sponsor'
  | 'data_steward'
  | 'reviewer'
  | 'admin';

type WizardStep = 'connection' | 'login' | 'project' | 'domain' | 'summary';

interface DomainStep {
  id: string;
  label: string;
  templateId: string;
  serviceId: string;
  objectiveLabel: string;
}

interface DomainResponse {
  objective: string;
  roleNote: string;
  policyRisk: string;
  checklistComplete: boolean;
  artifactComplete: boolean;
  serviceComplete: boolean;
}

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

const ROLE_PROMPTS: Record<Role, string> = {
  sponsor: 'Document the decision authority and approval threshold for this domain.',
  program_manager: 'Document delivery milestones, dependencies, and accountability owners.',
  analyst: 'Document analytic assumptions, method rationale, and validation approach.',
  data_steward: 'Document data governance controls, stewardship responsibilities, and quality risks.',
  reviewer: 'Document oversight criteria and evidence required for gate approval.',
  admin: 'Document platform, access, and audit configuration implications for this domain.',
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

  const tokenPreview = useMemo(() => {
    if (!token) {
      return 'No token issued yet.';
    }
    return `${token.slice(0, 24)}...`;
  }, [token]);

  const currentDomain = DOMAIN_STEPS[currentDomainIndex];
  const currentResponse =
    domainResponses[currentDomain.id] ??
    ({
      objective: '',
      roleNote: '',
      policyRisk: '',
      checklistComplete: false,
      artifactComplete: false,
      serviceComplete: false,
    } satisfies DomainResponse);
  const allDomainsComplete = DOMAIN_STEPS.every((step) => {
    const response = domainResponses[step.id];
    return Boolean(response?.checklistComplete && response?.artifactComplete && response?.serviceComplete);
  });

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
    const objectiveBase = priorObjective
      ? `Using prior domain output ("${priorObjective}"), define ${step.objectiveLabel.toLowerCase()} for ${projectContext}.`
      : `Define ${step.objectiveLabel.toLowerCase()} for ${projectContext}.`;

    const roleBase = `${ROLE_PROMPTS[role]} ${
      priorObjective ? `Incorporate prior domain context: "${priorObjective}".` : ''
    }`.trim();

    const policyBase =
      index <= 2
        ? 'Identify legal and policy constraints, data handling requirements, and approval checkpoints.'
        : 'Identify deployment, oversight, and operational risk controls with required approvals.';

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
        }),
        ...patch,
      },
    }));
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
          checklistComplete: current?.checklistComplete ?? false,
          artifactComplete: current?.artifactComplete ?? false,
          serviceComplete: current?.serviceComplete ?? false,
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
    const artifactPayload = await requestData(`/projects/${projectId}/artifacts`, 'POST', {
      templateId: currentDomain.templateId,
      title: `${currentDomain.label} Artifact`,
      markdown:
        `# ${currentDomain.label}\n\n` +
        `## Objective\n${currentResponse.objective}\n\n` +
        `## Role-specific note (${role})\n${currentResponse.roleNote}\n\n` +
        `## Policy / risk note\n${currentResponse.policyRisk}\n`,
    });

    const servicePayload = await requestData(`/projects/${projectId}/services`, 'POST', {
      serviceId: currentDomain.serviceId,
    });

    updateCurrentResponse({
      artifactComplete: true,
      serviceComplete: true,
      checklistComplete: true,
    });

    return {
      domain: currentDomain.label,
      artifact: artifactPayload,
      service: servicePayload,
    };
  }

  function canAdvanceDomain(): boolean {
    return Boolean(
      currentResponse.checklistComplete &&
        currentResponse.artifactComplete &&
        currentResponse.serviceComplete &&
        currentResponse.objective.trim() &&
        currentResponse.roleNote.trim(),
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
            <option value="program_manager">Program Manager</option>
            <option value="analyst">Analyst</option>
            <option value="sponsor">Sponsor</option>
            <option value="data_steward">Data Steward</option>
            <option value="reviewer">Reviewer</option>
            <option value="admin">Admin</option>
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
            <strong>Prior domain context:</strong> {previousDomainSummary()}
          </p>

          <label htmlFor="objective">{currentDomain.objectiveLabel}</label>
          <textarea
            id="objective"
            style={{...inputStyle, minHeight: '80px'}}
            value={currentResponse.objective}
            onChange={(event) => updateCurrentResponse({objective: event.target.value})}
          />

          <label htmlFor="roleNote">Role-specific note ({role})</label>
          <p>{ROLE_PROMPTS[role]}</p>
          <textarea
            id="roleNote"
            style={{...inputStyle, minHeight: '80px'}}
            value={currentResponse.roleNote}
            onChange={(event) => updateCurrentResponse({roleNote: event.target.value})}
          />

          <label htmlFor="policyRisk">Policy and risk note</label>
          <textarea
            id="policyRisk"
            style={{...inputStyle, minHeight: '80px'}}
            value={currentResponse.policyRisk}
            onChange={(event) => updateCurrentResponse({policyRisk: event.target.value})}
          />

          <button
            type="button"
            className="button button--secondary margin-right--sm"
            disabled={busy}
            onClick={() =>
              updateCurrentResponse({
                checklistComplete: !currentResponse.checklistComplete,
              })
            }>
            Toggle Checklist ({String(currentResponse.checklistComplete)})
          </button>

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
