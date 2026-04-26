# Cloud-Managed Deployment Profile

This profile is intentionally environment-agnostic and avoids hard-coding vendor-managed services into platform core logic.

## Core Principles

- Use provider interfaces (`StorageProvider`, `IdentityProvider`, `QueueProvider`, `ConnectorProvider`).
- Keep compliance controls independent from cloud service choice.
- Enforce NIST 800-53 control families via policy checks and runtime controls.

## Recommended Managed Equivalents (Examples)

- Object storage: any S3-compatible or equivalent object API
- Identity: standards-based OIDC/SAML provider
- Queue: managed message queue with retry and dead-letter support
- Secrets: managed secrets vault with audit logs

## Required Security Controls

- Access control with least privilege (AC)
- Audit logging and retention (AU)
- Configuration management baselines (CM)
- Incident response workflows (IR)
- System and information integrity monitoring (SI)
