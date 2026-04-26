import type {ConnectorAdapter, ConnectorResult, ConnectorRun} from './types';

export class ConnectorOrchestrator {
  constructor(
    private readonly adapters: ConnectorAdapter[],
    private readonly allowlist: ConnectorRun['connectorType'][],
  ) {}

  async run(
    connectorType: ConnectorRun['connectorType'],
    config: Record<string, unknown>,
  ): Promise<{run: ConnectorRun; result: ConnectorResult}> {
    if (!this.allowlist.includes(connectorType)) {
      throw new Error(`Connector type ${connectorType} is not allowlisted.`);
    }

    const adapter = this.adapters.find((candidate) => candidate.type === connectorType);
    if (!adapter) {
      throw new Error(`No adapter is registered for connector type ${connectorType}.`);
    }

    const run: ConnectorRun = {
      id: `run-${Date.now()}`,
      connectorType,
      startedAt: new Date().toISOString(),
      status: 'running',
      recordsIngested: 0,
      classificationTags: ['needs-review'],
    };

    const result = await adapter.pull(config);
    run.recordsIngested = result.records.length;
    run.schemaSummary = result.metadata.schema.join(', ');
    run.status = 'completed';
    run.endedAt = new Date().toISOString();
    return {run, result};
  }
}
