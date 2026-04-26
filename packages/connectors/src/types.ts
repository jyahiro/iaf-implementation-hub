export interface ConnectorRun {
  id: string;
  connectorType: 'file-share' | 's3-compatible' | 'rest-api';
  startedAt: string;
  endedAt?: string;
  status: 'running' | 'completed' | 'failed';
  recordsIngested: number;
  schemaSummary?: string;
  classificationTags: string[];
}

export interface ConnectorResult {
  records: Record<string, unknown>[];
  metadata: {
    source: string;
    schema: string[];
  };
}

export interface ConnectorAdapter {
  type: ConnectorRun['connectorType'];
  pull(config: Record<string, unknown>): Promise<ConnectorResult>;
}
