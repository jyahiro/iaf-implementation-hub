import fs from 'node:fs/promises';
import path from 'node:path';
import type {ConnectorAdapter, ConnectorResult} from '../types';

export class FileShareAdapter implements ConnectorAdapter {
  readonly type = 'file-share' as const;

  async pull(config: Record<string, unknown>): Promise<ConnectorResult> {
    const directoryPath = String(config.directoryPath ?? '');
    if (!directoryPath) {
      throw new Error('directoryPath is required for file-share connector');
    }

    const entries = await fs.readdir(directoryPath);
    const files = entries.filter((entry) => entry.endsWith('.json'));
    const records: Record<string, unknown>[] = [];

    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      const contents = await fs.readFile(fullPath, 'utf8');
      records.push(JSON.parse(contents) as Record<string, unknown>);
    }

    return {
      records,
      metadata: {
        source: directoryPath,
        schema: Object.keys(records[0] ?? {}),
      },
    };
  }
}
