---
sidebar_position: 41
---

# Platform Runbooks

## Local Development

1. Install dependencies from repository root.
2. Run API shim: `npm run platform:api`
3. Run web shim: `npm run platform:web`
4. Run docs site: `npm run start`

## Policy Guardrail Validation

- Run: `npm run platform:check-policy`
- Run: `npm run platform:check-connectors`

## Deployment Baselines

- Local/self-hosted: `infra/docker-compose.yml`
- Kubernetes: `infra/kubernetes/`
- Cloud-managed profile guidance: `infra/profiles/cloud-managed.md`
