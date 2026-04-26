# IAF Implementation Hub and Platform

This repository contains:

- A Docusaurus knowledge layer for IAF standards and implementation guidance.
- A full-platform scaffold (`apps/web`, `apps/api`) for end-to-end IAF workflow execution.
- Shared policy and connector packages to support environment-agnostic operation.

## Workspace Structure

- `apps/web` - platform user experience shell.
- `apps/api` - workflow, artifacts, services, audit, and connector orchestration.
- `packages/shared` - shared models and provider interfaces.
- `packages/policy` - policy-as-code controls and checks.
- `packages/connectors` - external data connector bridge adapters.
- `docs/` - guidance, templates, service catalog, and architecture runbooks.
- `infra/` - deployment profiles (local, Kubernetes, cloud-managed guidance).

## Common Commands

```bash
npm install
npm run start
npm run build
npm run platform:api
npm run platform:web
npm run platform:check-policy
npm run platform:check-connectors
```
