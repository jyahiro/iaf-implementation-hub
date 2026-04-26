import type {ConnectorAdapter, ConnectorResult} from '../types';

export class S3CompatibleAdapter implements ConnectorAdapter {
  readonly type = 's3-compatible' as const;

  async pull(config: Record<string, unknown>): Promise<ConnectorResult> {
    const bucket = String(config.bucket ?? 'unknown-bucket');
    return {
      records: [],
      metadata: {
        source: `s3-compatible://${bucket}`,
        schema: [],
      },
    };
  }
}
