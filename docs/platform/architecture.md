---
sidebar_position: 40
---

# Platform Architecture

The IAF Platform combines a knowledge layer (Docusaurus docs) with an execution layer (workflow API and project workspace).

## Execution Components

- `apps/web`: platform user experience shell.
- `apps/api`: domain workflow, artifacts, service operations, audit, connector orchestration.
- `packages/shared`: common models and provider interfaces.
- `packages/policy`: policy pack and validation engine.
- `packages/connectors`: external data connector bridge and adapters.

## Environment-Agnostic Design

Core logic depends on abstract providers, not vendor-specific services:

- Storage provider abstraction
- Identity provider abstraction
- Queue provider abstraction
- Connector provider abstraction

## Security and Compliance

The platform uses policy-as-code checks and documented control mappings aligned to:

- Evidence Act baseline
- M-13-13 (Open Data Policy)
- OPEN Government Data Act / Federal Data Strategy
- NIST AI RMF / M-24-10
- NIST 800-53 control families
