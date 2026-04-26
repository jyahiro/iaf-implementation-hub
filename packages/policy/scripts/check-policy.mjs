import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..', '..');
const requiredFiles = [
  'docs/public-sector/legal-guardrails.md',
  'docs/public-sector/templates/template-governance-domain-01-m-23-15-evidence-planning-checklist.md',
  'docs/public-sector/templates/template-governance-domain-03-open-data-fds-compliance-record.md',
  'docs/public-sector/templates/template-governance-domain-05-06-ai-rmf-m-24-10-assurance-case.md',
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(repoRoot, file)));
if (missing.length > 0) {
  console.error('Policy check failed. Missing required governance artifacts:\n' + missing.join('\n'));
  process.exit(1);
}

console.log('Policy check passed. Required governance artifacts are present.');
