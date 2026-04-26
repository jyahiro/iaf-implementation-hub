import type {AuditEvent} from '@iaf/shared';

export class AuditTrailService {
  private readonly events: AuditEvent[] = [];

  async record(event: AuditEvent): Promise<void> {
    this.events.push(event);
  }

  list(projectId: string): AuditEvent[] {
    return this.events.filter((event) => event.projectId === projectId);
  }
}
