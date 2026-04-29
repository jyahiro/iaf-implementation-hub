---
sidebar_position: 28
---

# Functional Roles, IAF Domains, and LRP Governance Matrix

## Document purpose

This technical reference defines how **four functional analytics roles** interact with each of the **seven INFORMS Analytics Framework (IAF) domains**. It is written for implementation teams, compliance officers, and platform operators who must trace **Law, Regulation, and Policy (LRP)** obligations to concrete workflow and automation behavior in the Hub.

**Scope:** Role-to-domain cells cite the **LRP layer that principally governs** that interaction. Where artificial intelligence (AI) or machine learning (ML) is in scope, **OMB Memorandum M-24-10** is treated as the **foundational compliance anchor** alongside the [NIST AI Risk Management Framework (AI RMF)](https://www.nist.gov/itl/ai-risk-management-framework). Non-AI analytics remain governed by the cited baseline authorities (for example, Evidence Act Title I, IQA, OPEN Government Data Act) without displacing M-24-10 where AI is present.

**Relationship to other artifacts:** Task-level RACI remains authoritative for assignment granularity in the [Task RACI Matrix](./role-task-matrix.md). This matrix complements RACI by anchoring **functional accountability** to **LRP** and to **computational governance triggers** expected in the Hub.

---

## Governance philosophy

> **These roles are defined by their functional contribution to the analytics lifecycle, ensuring compliance with Law, Regulation, and Policy (LRP) rather than administrative HR title.**  
> A “Data Steward,” “Model Architect,” “Compliance Lead,” or “Project Lead” is a **duty bundle** applied to work products, gates, and evidence—not a job code on an organization chart. The Hub models accountability against those duties so approvals, audit events, and policy checks remain traceable even when titles differ across agencies.

---

## Multiple roles per person

The Hub **explicitly allows one natural person to hold multiple functional roles** at the same time. Multi-role assignment is common in small teams and remains valid provided **separation of duties** required by agency policy is still satisfied through **approval paths, independent review, or compensating controls**—not by artificially restricting identities to a single role flag.

**Implementation rules:**

1. **Attribution:** Every approval, artifact version, service request, and audit event records the **role context** under which the action was taken (not merely the user id).
2. **Conflict handling:** When a single actor holds roles that would otherwise create a prohibited R/A conflict for a given gate, the workflow must **route accountability** to a designated alternate approver or elevate to an independent **Compliance Lead** or **Team Lead** per agency policy.
3. **Transparency:** Project-facing views should list **all active role bindings** for each member so RACI consumers can interpret multi-hatting without ambiguity.

For alignment between these **functional** roles and **TDSP-aligned** RACI codes used elsewhere, see [Roles and Responsibilities](./roles-and-responsibilities.md) and [By role (TDSP)](../start-here/by-role.md).

---

## OMB M-24-10 as the primary AI compliance anchor

For **AI-related** analytics work—spanning **Domain V (model development)** and **Domain VI (deployment)** as primary loci, and extending into **Domain II** (when AI/ML is in the solution class), **Domain III** (training/operational data subject to AI governance), **Domain IV** (when AI method families are selected), and **Domain VII** (ongoing AI assurance and recalibration)—**[OMB M-24-10](https://www.whitehouse.gov/wp-content/uploads/2024/03/M-24-10-Advancing-Governance-Innovation-and-Risk-Management-for-Agency-Use-of-Artificial-Intelligence.pdf)** is the **foundational** executive-branch policy anchor referenced in role–domain cells below, together with the **NIST AI RMF** where agencies map controls to NIST constructs. Domains I and non-AI paths continue to emphasize **Evidence Act Title I**, **M-13-13** (open data), **IQA**, **OPEN Government Data Act**, **NIST SP 800-53**, and **NARA** records obligations as applicable.

---

## IAF domain reference (columns)

| # | IAF domain (short label) | Canonical doc |
| ---: | --- | --- |
| I | Business problem (question) framing | [Domain I](/docs/domains/business-problem-framing/) |
| II | Analytics problem framing | [Domain II](/docs/domains/analytics-problem-framing/) |
| III | Data readiness | [Domain III](/docs/domains/data-readiness/) |
| IV | Methodology (approach) selection | [Domain IV](/docs/domains/methodology-selection/) |
| V | Analytics / model development | [Domain V](/docs/domains/model-building/) |
| VI | Deployment | [Domain VI](/docs/domains/deployment/) |
| VII | Analytics solution lifecycle management | [Domain VII](/docs/domains/lifecycle-management/) |

---

## Functional role × IAF domain × LRP matrix

The table below maps each **functional role** to **each IAF domain**. Every domain column cites **LRP** that governs that role–domain intersection. The **Governance trigger** column describes **computational governance** signals the Hub (or integrated policy-as-code checks) can use to **invoke** that role’s duty without relying on manual calendar management alone.

<div class="iaf-compliance-matrix">

| Functional role | Governance trigger (Hub / automation) | Domain I — Business problem framing | Domain II — Analytics problem framing | Domain III — Data readiness | Domain IV — Methodology selection | Domain V — Model development | Domain VI — Deployment | Domain VII — Lifecycle management |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Data Steward** | `dataset_registration_required`; `sensitivity_class_unknown`; `lineage_incomplete`; `open_data_fds_blocker`; **IQA** quality flag on published metric; schema or dictionary drift on governed assets | **Evidence Act** Title I (learning agenda alignment when data underpins measures); **M-13-13** (open data governance for planned public releases); **Privacy Act** / **eGov** policies for stakeholder data in framing | **Evidence Act** Title I & agency learning-agenda policy when analytic questions imply new measures; **Paperwork Reduction Act** when survey instruments feed analytics | **IQA**; **OPEN Government Data Act**; **Evidence Act** Title II; **Federal Data Strategy** (data inventory & quality); agency **records** policy for lineage | **IQA** fitness-for-purpose; agency **statistical** / **method** policy when data constraints bound methodology | **IQA** + **OPEN** / **FDS** for training & evaluation datasets; **NIST AI RMF** *Map/Measure* data governance; **M-24-10** data controls for **AI/ML** datasets | **M-24-10** operational data controls for **AI**; **NIST SP 800-53** (e.g., **AU**, **SC**, **SI**) for production data paths; **FISMA**-aligned handling | **NARA** disposition & retention; **Evidence Act** evaluation use of maintained data; **IQA** for sustained reporting metrics |
| **Model Architect** | `model_card_incomplete`; `risk_tier >= agency_threshold`; `bias_metric_breach`; `m24_10_assurance_case_not_approved`; `validation_stale_vs_baseline`; `non_reproducible_build` | **Evidence Act** Title I feasibility & ethics of measurement when models inform agency decisions; **M-13-13** when model outputs become open artifacts | **Evidence Act** Title I; agency **model transparency** policy; **NIST AI RMF** *Map* when AI/ML is candidate solution class; **M-24-10** scoping for **AI** use cases | **IQA** for modeling-ready data; **OPEN** / provenance requirements for training features | Agency **methodology** policy; **NIST AI RMF** *Map/Measure* for method families; **M-24-10** when **AI** methods are in scope | **M-24-10** (primary AI anchor) + **NIST AI RMF** *Measure/Manage* for model risk, documentation, validation, and human oversight | **M-24-10** + **AI RMF** *Manage* for production AI controls; **NIST SP 800-53** technical controls for model-serving stack; **FISMA** | **M-24-10** continuous assurance; **AI RMF** monitoring & incident learning; **NARA** for model artifact retention; **Evidence Act** for performance evidence |
| **Compliance Lead** | `policy_as_code_fail`; `gate_evidence_gap`; `control_assessment_required`; `m24_10_control_deficiency`; `separation_of_duties_violation`; `audit_sample_requested` | **Evidence Act** Title I; **M-13-13**; agency **ethics** / **equity** policy; **PRA** when collections support framing | **Evidence Act** Title I; **PRA**; **Privacy Act**; **FedRAMP** / **ATO** boundary when cloud analytics | **IQA**; **OPEN Government Data Act**; **Evidence Act** Title II; **Section 508** where applicable | Agency **acquisition** & **method** integrity rules; **NIST AI RMF** *Govern* when AI; **M-24-10** governance reviews | **M-24-10** (primary AI anchor) + **NIST AI RMF** *Govern/Map*; civil rights & nondiscrimination authorities where models affect protected classes (agency policy) | **M-24-10** + **AI RMF** *Manage*; **NIST SP 800-53** control evidence; **Contingency planning** & **IR** policy | **NARA**; **Evidence Act** evaluation; **M-24-10** post-deployment AI reviews; **OIG** / oversight interfaces per agency policy |
| **Project Lead** | `domain_gate_ready`; `artifact_approval_pending`; `service_sla_breach`; `milestone_dependency_block`; `raci_accountable_unassigned`; `multi_domain_traceability_gap` | **Evidence Act** Title I program learning & transparency; **M-13-13** checklist accountability; stakeholder **decision rights** policy | **Evidence Act** Title I; **PRA** clearance for data collections; success metric baselines | **OPEN** / **FDS** program execution; **IQA** accountability chain; data **risk acceptance** | Method **approval** under agency governance; **AI RMF** / **M-24-10** program gates when AI | **M-24-10** program accountability for **AI** model release; **AI RMF** lifecycle approvals | **M-24-10** go-live authorization package for **AI**; operations readiness; **ATO** sign-off coordination | **NARA** records closure; **Evidence Act** evidence for outcomes; **M-24-10** periodic AI review cadence |

</div>

### Legend and abbreviations

- **Evidence Act:** Foundations for Evidence-Based Policymaking Act ([Pub. L. 115–435](https://www.congress.gov/115/plaws/publ435/PLAW-115publ435.pdf)).
- **IQA:** Information Quality Act (OMB / agency data quality guidelines).
- **OPEN Government Data Act:** Title II of P.L. 115–435; **FDS** = Federal Data Strategy metadata and inventory expectations.
- **M-13-13:** OMB memorandum on open data default for government information.
- **M-24-10:** OMB memorandum on advancing governance, innovation, and risk management for agency use of AI—**primary AI anchor** for this matrix where AI/ML applies.
- **NIST AI RMF:** AI Risk Management Framework ([NIST](https://www.nist.gov/itl/ai-risk-management-framework)).
- **NIST SP 800-53:** Security and privacy control baseline for federal systems ([Rev. 5](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)).
- **NARA:** National Archives and Records Administration disposition and records schedules.
- **PRA:** Paperwork Reduction Act clearance for information collections.
- **FISMA:** Federal Information Security Modernization Act implementation (agency-specific).

---

## Computational governance notes

**Governance triggers** are intentionally expressed as **machine-readable predicates** (examples above) so they can be bound to:

- **Policy-as-code** evaluations in CI/CD or the Hub’s policy engine,
- **Workflow engine** transitions (for example, “block Domain VI gate until `m24_10_assurance_case_approved`”),
- **Audit and monitoring** hooks (for example, open **`audit_sample_requested`** when drift metrics exceed tolerance).

Triggers are **not** a substitute for human judgment where law or agency policy requires it; they **surface duty** to the correct functional role under LRP-aligned operating models.

---

## Maintenance

- Update this matrix when **OMB**, **NIST**, or agency **policy** materially changes AI, data, or records obligations.
- When the Hub adds new automated checks, register the corresponding **trigger id** in platform runbooks and cross-link from the [Compliance Checkpoints](./compliance-checkpoints.md) table.

## Related guidance

- [Compliance Checkpoints](./compliance-checkpoints.md)
- [Roles and Responsibilities](./roles-and-responsibilities.md)
- [Task RACI Matrix](./role-task-matrix.md)
- [Legal Guardrails](/docs/public-sector/legal-guardrails/)
