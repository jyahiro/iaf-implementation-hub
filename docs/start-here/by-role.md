---
sidebar_position: 3
---

# By role (TDSP)

The hub standardizes analytics product roles on the **Microsoft [Team Data Science Process (TDSP)](https://learn.microsoft.com/azure/architecture/data-science-process/overview)** so RACI, the interactive demo, and implementation guidance describe the same responsibilities.

## Role mapping (TDSP ↔ hub)

| TDSP role | Hub key (API / demo) | RACI code |
| --- | --- | --- |
| Group Manager | `sponsor` | `GM` |
| Team Lead | `reviewer` | `TL` |
| Project Lead | `program_manager` | `PL` |
| Data Scientist | `data_scientist` | `DS` |
| DevOps Engineer | `data_engineer` | `DO` |
| Application Developer | `analyst` | `AP` |
| Data Engineer | `data_steward` | `DE` |
| Platform Admin | `admin` | `AD` |

Task-level assignments use the [Task RACI Matrix](/docs/legal-policy/role-task-matrix/).

## Group Manager

- Own business outcomes, priorities, and resourcing for the analytics initiative.
- Authorize major governance gates and accept residual risk at decision points.
- Align the effort with agency mission, policy, and stakeholder expectations.

## Team Lead

- Lead day-to-day execution, quality, and resolution of blockers across TDSP stages.
- Ensure rigor of reviews, acceptance criteria, and handoffs between roles.
- Coordinate technical and operational readiness with Project Lead and DevOps.

## Project Lead

- Own business understanding, scope, success metrics, and stakeholder communications.
- Orchestrate domain progression, artifacts, and service requests across the IAF workflow.
- Maintain traceability from problem framing through deployment and lifecycle.

## Data Scientist

- Define and execute modeling, experimentation, validation, and monitoring criteria.
- Document methodology, assumptions, limitations, and performance trade-offs.
- Partner with Data Engineer and Application Developer on data and integration needs.

## DevOps Engineer

- Implement pipelines, environments, deployment, observability, and operational controls.
- Support secure, repeatable releases and production sustainment practices.
- Partner with Data Scientist and Application Developer on packaging and integration.

## Application Developer

- Integrate analytic capabilities into applications, APIs, and mission workflows.
- Implement user-facing or system-facing features that consume model outputs responsibly.
- Contribute to acceptance tests, documentation, and operational runbooks where code ships.

## Data Engineer

- Own data acquisition, transformation, quality, lineage, and governance-aligned handling.
- Support fit-for-purpose datasets and controls required for modeling and reporting.
- Coordinate with stewards, security, and platform policies on data lifecycle.

## Platform Admin

- Configure platform identity, access, audit, and operational guardrails for the hub.
- Supports all domains; not a TDSP customer-team role but required for enterprise operation.

## Functional roles, LRP, and domains

For a **single table** mapping **Data Steward**, **Model Architect**, **Compliance Lead**, and **Project Lead** across **all seven IAF domains**—with **Law, Regulation, and Policy (LRP)** in each cell, **computational governance triggers**, and **OMB M-24-10** as the primary AI anchor—see [Functional roles, IAF domains, and LRP governance matrix](/docs/legal-policy/functional-role-domain-lrp-matrix/). That document also states the governance philosophy that roles are **duty bundles**, not HR titles, and that **one person may hold multiple roles** when policy allows.
