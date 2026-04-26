import type {ServiceDefinition, ServiceRequest} from '@iaf/shared';

const DEFAULT_DEFINITIONS: ServiceDefinition[] = [
  {
    id: 'service-01',
    title: 'Problem Framing Facilitation',
    iafTaskCoverage: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'],
    requiredInputTemplateIds: ['template-domain-1-business-problem-brief'],
    outputTemplateIds: ['template-domain-2-analytics-problem-statement'],
    targetSlaBusinessDays: 10,
  },
  {
    id: 'service-02',
    title: 'Data Readiness Assessment',
    iafTaskCoverage: ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8'],
    requiredInputTemplateIds: ['template-domain-3-data-readiness-assessment'],
    outputTemplateIds: ['template-governance-domain-03-open-data-fds-compliance-record'],
    targetSlaBusinessDays: 15,
  },
];

export class ServiceCatalogService {
  private readonly requests = new Map<string, ServiceRequest>();
  private readonly definitions = new Map(DEFAULT_DEFINITIONS.map((definition) => [definition.id, definition]));

  listDefinitions(): ServiceDefinition[] {
    return Array.from(this.definitions.values());
  }

  submit(request: ServiceRequest): ServiceRequest {
    if (!this.definitions.has(request.serviceId)) {
      throw new Error(`Unknown service definition: ${request.serviceId}`);
    }
    this.requests.set(request.id, request);
    return request;
  }

  assign(requestId: string, assignee: string): ServiceRequest {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error(`Unknown service request: ${requestId}`);
    }
    const updated: ServiceRequest = {
      ...request,
      assignedTo: assignee,
      status: 'assigned',
    };
    this.requests.set(requestId, updated);
    return updated;
  }

  complete(requestId: string, outputArtifactIds: string[]): ServiceRequest {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error(`Unknown service request: ${requestId}`);
    }
    const updated: ServiceRequest = {
      ...request,
      status: 'completed',
      outputArtifactIds,
      completedAt: new Date().toISOString(),
    };
    this.requests.set(requestId, updated);
    return updated;
  }
}
