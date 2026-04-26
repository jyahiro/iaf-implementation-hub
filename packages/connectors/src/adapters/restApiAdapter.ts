import type {ConnectorAdapter, ConnectorResult} from '../types';

export class RestApiAdapter implements ConnectorAdapter {
  readonly type = 'rest-api' as const;

  async pull(config: Record<string, unknown>): Promise<ConnectorResult> {
    const endpoint = String(config.endpoint ?? '');
    if (!endpoint) {
      throw new Error('endpoint is required for rest-api connector');
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Connector request failed: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as Record<string, unknown> | Record<string, unknown>[];
    const records = Array.isArray(payload) ? payload : [payload];
    return {
      records,
      metadata: {
        source: endpoint,
        schema: Object.keys(records[0] ?? {}),
      },
    };
  }
}
