# IAF Platform Infrastructure Profiles

This directory contains deployment overlays and profile guidance for running the platform in multiple environments.

## Profiles

- `docker-compose.yml`: local/self-hosted baseline.
- `kubernetes/`: portable cluster baseline.
- `profiles/cloud-managed.md`: cloud-managed deployment guidance without hard-wired vendor dependencies.

## Security Baseline

All profiles align to NIST 800-53 control family expectations and rely on policy-as-code checks in CI.
