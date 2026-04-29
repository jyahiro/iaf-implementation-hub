---
sidebar_position: 39
---

# CFR / eCFR regulatory watch

## Purpose

This document describes how the Hub can **detect and triage** updates to the **Code of Federal Regulations (CFR)** as published through **eCFR**—so implementation teams know when to refresh citations, templates, and compliance narratives. It complements the interactive demo’s read-only [eCFR API](https://www.ecfr.gov/reader-aids/ecfr-developer-resources) usage (`titles.json`) and the [Functional roles, IAF domains, and LRP governance matrix](/docs/legal-policy/functional-role-domain-lrp-matrix/).

## Is an automated “CFR alert” possible?

**Yes.** The public **eCFR versioner API** exposes machine-readable **title-level metadata** (including `latest_amended_on`, `latest_issue_date`, and `up_to_date_as_of`) without an API key. A scheduled job can:

1. **Fetch** `GET https://www.ecfr.gov/api/versioner/v1/titles.json`.
2. **Filter** to CFR titles your program cares about (see `config/ecfr-watch.json`).
3. **Compare** against a committed baseline (`data/ecfr-watch-snapshot.json`).
4. **Score relevance** to the Hub using simple, explainable rules (watch tier, keywords in title names, substantive amendment dates).
5. **Notify** maintainers (for example via GitHub Actions step summaries, issues, or chat integrations).

**What this does *not* do by itself:** legal interpretation, automatic “must update” decisions, or section-level diffing. For **substantive** change analysis, teams typically pair title metadata with:

- **Federal Register** document search (rule preambles, RINs), and/or
- **Point-in-time XML** from the versioner (`/api/versioner/v1/full/{date}/title-{n}.xml`) for controlled diff jobs—**large** payloads; use sparingly and respect [eCFR / FR API use policies](https://www.federalregister.gov/reader-aids/developer-resources/rest-api).

## Hub implementation (repository)

| Artifact | Role |
| --- | --- |
| `config/ecfr-watch.json` | Watched CFR titles, tiers, and Hub keyword hints. |
| `data/ecfr-watch-snapshot.json` | Last-reviewed **metadata** baseline for those titles. |
| `scripts/ecfr-hub-relevance.mjs` | Fetches current `titles.json`, prints a markdown diff, optional `--write-snapshot`. |
| `.github/workflows/ecfr-regulatory-watch.yml` | Scheduled workflow that runs the script and writes a **job summary**. |

Refresh the snapshot **only after** a human confirms the watch output:

```bash
node scripts/ecfr-hub-relevance.mjs --write-snapshot
```

## Relevance analysis (design stance)

**Relevance** is intentionally **rule-based and auditable**—not an opaque model:

- **Priority titles** (for example acquisition, commerce/standards context, environment, emergency management) default to **“review suggested”** when amendment metadata moves.
- **Keyword hints** in `ecfr-watch.json` catch title names aligned with Hub themes (data, acquisition, privacy, security, …).
- **Substantive signal:** a change in `latest_amended_on` is a stronger indicator than `latest_issue_date` alone (see eCFR reader aids on **substantive vs non-substantive** updates).

Extend later with: RIN allowlists, part-level watch lists, or Federal Register webhooks—**without** replacing the baseline title-metadata check.

## Operational notes

- **`import_in_progress`:** When eCFR sets this to `true`, treat outputs as **potentially incomplete**; re-run after it clears.
- **Rate limits:** Prefer **daily/weekly** schedules and cached snapshots; avoid hammering APIs from CI matrices.
- **AI compliance anchor:** For CFR changes that affect **agency AI** use, continue to align downstream analysis with **[OMB M-24-10](https://www.whitehouse.gov/wp-content/uploads/2024/03/M-24-10-Advancing-Governance-Innovation-and-Risk-Management-for-Agency-Use-of-Artificial-Intelligence.pdf)** and the [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) per [Compliance checkpoints](/docs/legal-policy/compliance-checkpoints/).

## Related

- [Compliance checkpoints](/docs/legal-policy/compliance-checkpoints/)
- [Platform architecture](/docs/platform/architecture/)
