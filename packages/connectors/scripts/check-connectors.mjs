import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..', '..');
const requiredAdapterFiles = [
  'packages/connectors/src/adapters/fileShareAdapter.ts',
  'packages/connectors/src/adapters/s3CompatibleAdapter.ts',
  'packages/connectors/src/adapters/restApiAdapter.ts',
];

const missing = requiredAdapterFiles.filter((file) => !fs.existsSync(path.join(repoRoot, file)));
if (missing.length > 0) {
  console.error('Connector check failed. Missing adapter files:\n' + missing.join('\n'));
  process.exit(1);
}

console.log('Connector check passed. Adapter contracts are present.');
