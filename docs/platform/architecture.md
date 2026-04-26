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

- [Evidence Act baseline](https://www.congress.gov/115/plaws/publ435/PLAW-115publ435.pdf)
- [M-13-13 (Open Data Policy)](https://obamawhitehouse.archives.gov/sites/default/files/omb/memoranda/2013/m-13-13.pdf)
- [OPEN Government Data Act / Federal Data Strategy](https://strategy.data.gov/)
- [NIST AI RMF / OMB M-24-10](https://www.whitehouse.gov/wp-content/uploads/2024/03/M-24-10-Advancing-Governance-Innovation-and-Risk-Management-for-Agency-Use-of-Artificial-Intelligence.pdf)
- [NIST SP 800-53 Rev. 5 control families](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
