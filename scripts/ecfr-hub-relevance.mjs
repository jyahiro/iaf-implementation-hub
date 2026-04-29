/**
 * Compare eCFR titles.json metadata for watched CFR titles against data/ecfr-watch-snapshot.json.
 * Uses the public eCFR versioner API (no API key). See docs/platform/cfr-regulatory-watch.md.
 *
 * Usage:
 *   node scripts/ecfr-hub-relevance.mjs              # diff vs snapshot; print markdown
 *   node scripts/ecfr-hub-relevance.mjs --write-snapshot   # refresh snapshot after human review
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const configPath = path.join(root, 'config', 'ecfr-watch.json');
const snapshotPath = path.join(root, 'data', 'ecfr-watch-snapshot.json');
const ECFR_TITLES = 'https://www.ecfr.gov/api/versioner/v1/titles.json';

async function main() {
  const writeSnapshot = process.argv.includes('--write-snapshot');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const watched = new Map(config.watchedTitles.map((t) => [t.number, t]));
  const keywords = (config.hubRelevanceKeywords || []).map((k) => k.toLowerCase());

  const res = await fetch(ECFR_TITLES);
  if (!res.ok) {
    throw new Error(`eCFR titles request failed (${res.status})`);
  }
  const data = await res.json();
  const rows = data.titles ?? [];

  const current = {
    fetchedAt: new Date().toISOString(),
    meta: data.meta ?? null,
    titles: {},
  };

  for (const t of rows) {
    if (!watched.has(t.number)) {
      continue;
    }
    current.titles[String(t.number)] = {
      name: t.name,
      latest_amended_on: t.latest_amended_on,
      latest_issue_date: t.latest_issue_date,
      up_to_date_as_of: t.up_to_date_as_of,
    };
  }

  if (writeSnapshot) {
    fs.mkdirSync(path.dirname(snapshotPath), {recursive: true});
    fs.writeFileSync(snapshotPath, JSON.stringify(current, null, 2));
    process.stdout.write(`Wrote ${path.relative(root, snapshotPath)}\n`);
    return;
  }

  if (!fs.existsSync(snapshotPath)) {
    fs.mkdirSync(path.dirname(snapshotPath), {recursive: true});
    fs.writeFileSync(snapshotPath, JSON.stringify(current, null, 2));
    process.stdout.write(`Initialized ${path.relative(root, snapshotPath)} (no prior snapshot).\n`);
    return;
  }

  const previous = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const changes = [];

  for (const num of [...watched.keys()].sort((a, b) => a - b)) {
    const key = String(num);
    const prev = previous.titles[key];
    const cur = current.titles[key];
    if (!cur) {
      continue;
    }
    const meta = watched.get(num);
    const tier = meta?.tier ?? 'context';
    const note = String(meta?.note ?? '').toLowerCase();
    const nameLower = String(cur.name ?? '').toLowerCase();
    const keywordHit = keywords.some((k) => nameLower.includes(k) || note.includes(k));

    const diffs = [];
    if (!prev) {
      diffs.push('(no prior snapshot row)');
    } else {
      if (prev.latest_amended_on !== cur.latest_amended_on) {
        diffs.push(`latest_amended_on \`${prev.latest_amended_on}\` → \`${cur.latest_amended_on}\``);
      }
      if (prev.latest_issue_date !== cur.latest_issue_date) {
        diffs.push(`latest_issue_date \`${prev.latest_issue_date}\` → \`${cur.latest_issue_date}\``);
      }
      if (prev.up_to_date_as_of !== cur.up_to_date_as_of) {
        diffs.push(`up_to_date_as_of \`${prev.up_to_date_as_of}\` → \`${cur.up_to_date_as_of}\``);
      }
    }

    if (!diffs.length) {
      continue;
    }

    const substantive = prev && prev.latest_amended_on !== cur.latest_amended_on;
    const hubReview =
      tier === 'priority' || keywordHit || substantive || diffs.some((d) => d.includes('latest_amended_on'));

    changes.push({
      num,
      name: cur.name,
      tier,
      diffs,
      hubReview,
    });
  }

  let out = '## eCFR / CFR regulatory watch (automated check)\n\n';
  out += `**Compared at:** ${current.fetchedAt}  \n`;
  out += `**eCFR \`meta\`:** \`${JSON.stringify(current.meta)}\`  \n\n`;

  if (!changes.length) {
    out += 'No metadata changes for watched titles since the committed snapshot.\n';
  } else {
    out += '| CFR Title | Name | Watch tier | Hub relevance | Detected changes |\n';
    out += '| ---: | --- | --- | --- | --- |\n';
    for (const c of changes) {
      const rel = c.hubReview ? '**Review** (priority watch, keyword, or substantive date)' : 'FYI (metadata only—confirm materiality)';
      out += `| ${c.num} | ${c.name} | ${c.tier} | ${rel} | ${c.diffs.join('<br/>')} |\n`;
    }
    out +=
      '\n> **Not legal advice.** Use [eCFR reader aids](https://www.ecfr.gov/reader-aids/ecfr-developer-resources/understanding-ecfr-dates) to interpret `latest_amended_on` vs `latest_issue_date`.\n';
  }

  process.stdout.write(`${out}\n`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${out}\n`);
  }
}

main().catch((err) => {
  process.stderr.write(String(err?.stack ?? err) + '\n');
  process.exit(1);
});
