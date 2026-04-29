/**
 * Scans all Markdown and MDX files under docs/ for Hub audience frontmatter
 * and writes src/data/hubDocContext.generated.json.
 * Run via: npm run prebuild (or manually before build).
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const docsDir = path.join(root, 'docs');
const outFile = path.join(root, 'src', 'data', 'hubDocContext.generated.json');

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      walk(full, acc);
    } else if (/\.mdx?$/.test(name.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function parseBracketList(line, key) {
  const re = new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]\\s*$`);
  const m = re.exec(line.trim());
  if (!m) {
    return null;
  }
  return m[1]
    .split(',')
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

function parseFrontmatter(filePath, raw) {
  if (!raw.startsWith('---')) {
    return null;
  }
  const end = raw.indexOf('\n---', 3);
  if (end === -1) {
    return null;
  }
  const block = raw.slice(3, end).trim();
  const rel = path.relative(docsDir, filePath).replace(/\\/g, '/');
  const id = rel.replace(/\.mdx?$/, '');

  let hub_core = false;
  let hub_contexts = [];
  let hub_jurisdiction_tags = [];

  for (const line of block.split('\n')) {
    const t = line.trim();
    if (/^hub_core:\s*true\s*$/i.test(t)) {
      hub_core = true;
    }
    const c = parseBracketList(t, 'hub_contexts');
    if (c) {
      hub_contexts = c;
    }
    const j = parseBracketList(t, 'hub_jurisdiction_tags');
    if (j) {
      hub_jurisdiction_tags = j;
    }
  }

  if (!hub_core && hub_contexts.length === 0 && hub_jurisdiction_tags.length === 0) {
    return null;
  }

  return {
    id,
    hub_core,
    hub_contexts,
    hub_jurisdiction_tags,
  };
}

function main() {
  const files = walk(docsDir);
  const map = {};
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const meta = parseFrontmatter(file, raw);
    if (meta) {
      map[meta.id] = {
        hub_core: meta.hub_core,
        hub_contexts: meta.hub_contexts,
        hub_jurisdiction_tags: meta.hub_jurisdiction_tags,
      };
    }
  }
  fs.mkdirSync(path.dirname(outFile), {recursive: true});
  fs.writeFileSync(outFile, JSON.stringify(map, null, 2));
  process.stdout.write(`Wrote ${path.relative(root, outFile)} (${Object.keys(map).length} tagged docs)\n`);
}

main();
