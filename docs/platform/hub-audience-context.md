---
sidebar_position: 38
hub_core: true
---

# Hub audience context (YAML frontmatter)

The Hub stays **one framework** while tailoring the **documentation sidebar** to each visitor’s **relationship to the data asset** and **primary jurisdiction**. Audience segmentation is driven by **declarative frontmatter**, not forked copies of the IAF.

## User contexts (A)

| Context value | Who it is for | Emphasis |
| --- | --- | --- |
| `federal-agency` | Federal civilian or defense program offices | Compliance & stewardship — NARA disposition, FISMA, OMB policy cadence. |
| `state-local` | State, territorial, local, tribal, or regional programs | Interoperability & service delivery — Medicaid, transportation, public safety, grants alignment. |
| `connector` | Intermediaries (HIEs, QIOs, integrators, federated stewards) | Data exchange & federated governance across organizational boundaries. |

Declare one or more on a doc:

```yaml
hub_contexts: [federal-agency]
```

## Jurisdiction tags (B — use case filter)

**Primary jurisdiction** (selected on the docs landing page and persisted in the browser) applies a **profile**: allowed contexts + hidden tags.

Tag docs that should **drop out of the sidebar** for certain profiles (routes remain valid if bookmarked):

```yaml
hub_jurisdiction_tags: [nara-archival]
```

Example: **Local health department** hides items tagged `nara-archival` so HIPAA-aligned material stays in focus without maintaining a separate site.

## Universal (always-on) pages

Mark reference pages that must appear in every profile:

```yaml
hub_core: true
```

## Regeneration

After editing doc frontmatter, refresh the client metadata map:

```bash
node scripts/generate-hub-doc-context.mjs
```

`npm run build` runs this automatically via `prebuild`.

## Related

- [CFR / eCFR regulatory watch](/docs/platform/cfr-regulatory-watch/)
- [Platform architecture](/docs/platform/architecture/)
