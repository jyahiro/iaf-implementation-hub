export type DomainId =
  | 'domain-1-framing'
  | 'domain-2-analytics-framing'
  | 'domain-3-data'
  | 'domain-4-methodology'
  | 'domain-5-build'
  | 'domain-6-deploy'
  | 'domain-7-lifecycle';

export type DomainStatus = 'not_started' | 'in_progress' | 'ready_for_review' | 'approved';

export type ArtifactStatus = 'draft' | 'in_review' | 'approved' | 'superseded';

export type ServiceRequestStatus =
  | 'submitted'
  | 'triaged'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'closed';

export type Role = 'sponsor' | 'program_manager' | 'analyst' | 'data_steward' | 'reviewer' | 'admin';

export interface Organization {
  id: string;
  name: string;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  currentDomain: DomainId;
}

export interface DomainStage {
  id: string;
  projectId: string;
  domain: DomainId;
  status: DomainStatus;
  checklist: ChecklistItem[];
  requiredArtifactTemplateIds: string[];
  approvedBy?: string;
  approvedAt?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface Artifact {
  id: string;
  projectId: string;
  domain: DomainId;
  templateId: string;
  title: string;
  status: ArtifactStatus;
  markdown: string;
  version: number;
  ownerId: string;
  updatedAt: string;
}

export interface ServiceDefinition {
  id: string;
  title: string;
  iafTaskCoverage: string[];
  requiredInputTemplateIds: string[];
  outputTemplateIds: string[];
  targetSlaBusinessDays: number;
}

export interface ServiceRequest {
  id: string;
  projectId: string;
  serviceId: string;
  status: ServiceRequestStatus;
  requestedBy: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  outputArtifactIds: string[];
}

export interface ApprovalGate {
  id: string;
  projectId: string;
  domain: DomainId;
  name: string;
  requiredArtifactIds: string[];
  passed: boolean;
  approverId?: string;
  approvedAt?: string;
}

export interface AuditEvent {
  id: string;
  projectId: string;
  actorId: string;
  actorRole: Role;
  eventType: string;
  eventTimestamp: string;
  payload: Record<string, unknown>;
}
