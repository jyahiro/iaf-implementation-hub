# IAF Implementation Hub and Platform

This repository contains:

- A **Docusaurus** knowledge layer for INFORMS Analytics Framework (IAF) standards, templates, service catalog, and public-sector implementation guidance.
- A **platform scaffold** (`apps/web`, `apps/api`) for end-to-end IAF workflow execution, plus shared packages for policy checks and connectors.

## Workspace structure

- `apps/web` — platform user experience shell.
- `apps/api` — workflow, artifacts, services, audit, and connector orchestration.
- `packages/shared` — shared models and provider interfaces.
- `packages/policy` — policy-as-code controls and checks.
- `packages/connectors` — external data connector bridge adapters.
- `docs/` — guidance, templates, service catalog, and architecture runbooks.
- `infra/` — deployment profiles (local, Kubernetes, cloud-managed guidance).

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (bundled with Node)

## Getting started

```bash
npm install
npm run start
```

Open the local URL shown in the terminal to browse the site. Use `npm run build` to produce a static build in `build/`.

## Platform commands

```bash
npm run platform:api
npm run platform:web
npm run platform:check-policy
npm run platform:check-connectors
```

## Deployment

GitHub Pages deployment uses the Docusaurus deploy flow (see [Docusaurus deployment](https://docusaurus.io/docs/deployment)). Configure `GIT_USER` or `USE_SSH` as needed for your environment.

## Additional resources

- [Docusaurus documentation](https://docusaurus.io/docs)
- [GitHub Pages](https://pages.github.com/)
