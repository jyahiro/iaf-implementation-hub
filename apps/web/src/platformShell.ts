import type {DomainId, Role} from '@iaf/shared';

export interface UserSession {
  userId: string;
  roles: Role[];
  workspaceId: string;
}

export interface DomainProgressCard {
  domain: DomainId;
  status: 'not_started' | 'in_progress' | 'ready_for_review' | 'approved';
  requiredArtifacts: number;
  approvedArtifacts: number;
  policyStatus: 'pass' | 'fail' | 'pending';
}

export interface PlatformDashboard {
  projectId: string;
  currentDomain: DomainId;
  domainCards: DomainProgressCard[];
  openServiceRequests: number;
  pendingApprovals: number;
}

export function createEmptyDashboard(projectId: string): PlatformDashboard {
  return {
    projectId,
    currentDomain: 'domain-1-framing',
    domainCards: [],
    openServiceRequests: 0,
    pendingApprovals: 0,
  };
}
