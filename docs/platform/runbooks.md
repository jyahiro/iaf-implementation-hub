---
sidebar_position: 41
---

# Platform Runbooks

## Local Development

1. Install dependencies from repository root.
2. Run API shim: `npm run platform:api`
3. Run web shim: `npm run platform:web`
4. Open the MVP UI: `http://localhost:4200`
5. Use API health check: `http://localhost:4100/health`
6. Run docs site (optional): `npm run start`

## MVP Authentication Flow

1. In the web MVP, login with email + role.
2. The API issues a bearer token.
3. Use that token automatically for project, artifact, and service actions.
4. Persisted state is written to `platform-data/state.json`.

## Policy Guardrail Validation

- Run: `npm run platform:check-policy`
- Run: `npm run platform:check-connectors`

## Deployment Baselines

- Local/self-hosted: `infra/docker-compose.yml`
- Kubernetes: `infra/kubernetes/`
- Cloud-managed profile guidance: `infra/profiles/cloud-managed.md`
