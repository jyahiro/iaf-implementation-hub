import type {Artifact, AuditEvent, DomainStage, Project, ServiceRequest} from '@iaf/shared';
import type {ConnectorOrchestrator} from '@iaf/connectors';
import {overallPass, evaluatePolicyForDomain} from '@iaf/policy';
import {ArtifactService} from './services/artifactService';
import {AuditTrailService} from './services/auditTrailService';
import {ServiceCatalogService} from './services/serviceCatalogService';
import {WorkflowEngine} from './services/workflowEngine';

export class PlatformApi {
  constructor(
    private readonly workflows: WorkflowEngine,
    private readonly artifacts: ArtifactService,
    private readonly services: ServiceCatalogService,
    private readonly audit: AuditTrailService,
    private readonly connectors: ConnectorOrchestrator,
  ) {}

  async createProject(project: Project, actorId: string): Promise<Project> {
    await this.audit.record({
      id: `audit-${Date.now()}`,
      projectId: project.id,
      actorId,
      actorRole: 'program_manager',
      eventType: 'project_created',
      eventTimestamp: new Date().toISOString(),
      payload: {project},
    });
    return project;
  }

  async submitArtifact(artifact: Artifact, actorId: string): Promise<Artifact> {
    const saved = await this.artifacts.saveArtifact(artifact);
    await this.audit.record({
      id: `audit-${Date.now()}`,
      projectId: artifact.projectId,
      actorId,
      actorRole: 'analyst',
      eventType: 'artifact_saved',
      eventTimestamp: new Date().toISOString(),
      payload: {artifactId: artifact.id, status: artifact.status},
    });
    return saved;
  }

  evaluateDomainPolicy(stage: DomainStage, evidence: Record<string, unknown>): {passed: boolean; details: ReturnType<typeof evaluatePolicyForDomain>} {
    const details = evaluatePolicyForDomain(stage.domain, evidence);
    return {
      passed: overallPass(details),
      details,
    };
  }

  async advanceDomain(stage: DomainStage, approvedArtifactIds: string[], policyPassed: boolean): Promise<DomainStage> {
    return this.workflows.advance(stage, approvedArtifactIds, policyPassed);
  }

  async requestService(request: ServiceRequest): Promise<ServiceRequest> {
    return this.services.submit(request);
  }

  async runConnector(
    connectorType: 'file-share' | 's3-compatible' | 'rest-api',
    config: Record<string, unknown>,
    actorId: string,
    projectId: string,
  ): Promise<Awaited<ReturnType<ConnectorOrchestrator['run']>>> {
    const result = await this.connectors.run(connectorType, config);
    await this.audit.record({
      id: `audit-${Date.now()}`,
      projectId,
      actorId,
      actorRole: 'data_steward',
      eventType: 'connector_run_completed',
      eventTimestamp: new Date().toISOString(),
      payload: {
        connectorType,
        runId: result.run.id,
        recordsIngested: result.run.recordsIngested,
      },
    });
    return result;
  }

  listAuditEvents(projectId: string): AuditEvent[] {
    return this.audit.list(projectId);
  }
}
