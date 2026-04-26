---
sidebar_position: 42
---

# MVP User Flow

This runbook describes the current authenticated MVP sequence in one place.

## End-to-End Flow

1. Login using email and role in the platform web UI.
2. Create a project in Domain I.
3. Create a markdown-backed artifact for the domain template.
4. Submit a service request tied to the project.
5. Review project dashboard summary and audit output.

## Current API Routes

- `GET /health`
- `POST /auth/login`
- `GET /projects`
- `POST /projects`
- `POST /projects/{projectId}/artifacts`
- `POST /projects/{projectId}/services`
- `GET /projects/{projectId}/dashboard`
- `GET /projects/{projectId}/audit`

## Security Model (MVP)

- Token-based bearer authentication.
- Per-user project listing.
- Audit events on user/project/artifact/service actions.
- Policy and connector checks available through workspace scripts.

## Next Hardening Steps

- Replace dev token scheme with OIDC integration through `IdentityProvider`.
- Move JSON persistence to pluggable storage/DB implementation.
- Enforce role-based authorization by endpoint.
- Add domain gate APIs for explicit stage advancement and approvals.
