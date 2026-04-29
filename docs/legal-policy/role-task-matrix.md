---
sidebar_position: 33
---

# IAF Task RACI Matrix (TDSP-aligned)

This page provides a placeholder RACI mapping and task descriptions for the INFORMS Analytics Framework tasks used by the interactive demo. **Role names and short codes follow the Microsoft [Team Data Science Process (TDSP)](https://learn.microsoft.com/azure/architecture/data-science-process/overview)** for analytics products so the matrix, documentation, and interactive demo stay consistent.

## Role legend (TDSP)

- `GM`: Group Manager
- `TL`: Team Lead
- `PL`: Project Lead
- `DS`: Data Scientist
- `DO`: DevOps Engineer
- `AP`: Application Developer
- `DE`: Data Engineer
- `AD`: Platform Admin (hub operations; outside the core TDSP customer team)

Stable **hub keys** (`sponsor`, `reviewer`, `program_manager`, …) used in APIs and the demo map to these TDSP roles on [By role](/docs/start-here/by-role/).

## RACI Key

- `R`: Responsible
- `A`: Accountable
- `C`: Consulted
- `I`: Informed

## Domain I: Business Problem (Question) Framing

<a id="task-11"></a>
### Task 1.1
Define mission problem and measurable outcomes.

RACI: `R=AP`, `A=GM`, `C=PL,TL`, `I=DE,AD`

<a id="task-12"></a>
### Task 1.2
Identify stakeholders and decision cadence.

RACI: `R=PL`, `A=GM`, `C=AP,TL`, `I=DE,AD`

<a id="task-13"></a>
### Task 1.3
Capture decision criteria and constraints.

RACI: `R=AP`, `A=PL`, `C=TL,DE`, `I=GM,AD`

<a id="task-14"></a>
### Task 1.4
Define scope boundaries and assumptions.

RACI: `R=PL`, `A=PL`, `C=AP,DE`, `I=GM,TL,AD`

<a id="task-15"></a>
### Task 1.5
Confirm governance and approval pathway.

RACI: `R=PL`, `A=GM`, `C=TL,DE`, `I=AP,AD`

<a id="task-16"></a>
### Task 1.6
Approve problem framing brief for execution.

RACI: `R=GM`, `A=GM`, `C=PL,TL`, `I=AP,DE,AD`

## Domain II: Analytics Problem Framing

<a id="task-21"></a>
### Task 2.1
Translate business problem into analytics objectives.

RACI: `R=AP`, `A=PL`, `C=DS`, `I=GM,TL`

<a id="task-22"></a>
### Task 2.2
Define candidate analytical approaches.

RACI: `R=DS`, `A=PL`, `C=AP,DO`, `I=GM,TL`

<a id="task-23"></a>
### Task 2.3
Set success metrics and performance thresholds.

RACI: `R=AP`, `A=PL`, `C=DS,TL`, `I=GM`

<a id="task-24"></a>
### Task 2.4
Document assumptions and trade-offs.

RACI: `R=PL`, `A=PL`, `C=AP,DS,TL`, `I=GM`

<a id="task-25"></a>
### Task 2.5
Select preferred analytics approach.

RACI: `R=DS`, `A=PL`, `C=AP,TL`, `I=GM,DO`

<a id="task-26"></a>
### Task 2.6
Define acceptance criteria for next gate.

RACI: `R=TL`, `A=PL`, `C=AP,DS`, `I=GM`

<a id="task-27"></a>
### Task 2.7
Authorize transition to data readiness activities.

RACI: `R=GM`, `A=GM`, `C=PL,TL`, `I=AP,DS,DO`

## Domain III: Data

<a id="task-31"></a>
### Task 3.1
Inventory data sources and owners.

RACI: `R=DE`, `A=PL`, `C=DO,AP`, `I=GM,TL`

<a id="task-32"></a>
### Task 3.2
Classify data sensitivity and handling requirements.

RACI: `R=DE`, `A=DE`, `C=TL,AD`, `I=PL,GM`

<a id="task-33"></a>
### Task 3.3
Assess data quality and fitness for use.

RACI: `R=DE`, `A=PL`, `C=AP,DO`, `I=GM,TL`

<a id="task-34"></a>
### Task 3.4
Design ingestion, transformation, and lineage flow.

RACI: `R=DO`, `A=PL`, `C=DE,AD`, `I=AP,GM`

<a id="task-35"></a>
### Task 3.5
Implement secure data access and controls.

RACI: `R=DO`, `A=AD`, `C=DE,TL`, `I=PL,GM`

<a id="task-36"></a>
### Task 3.6
Produce data readiness evidence package.

RACI: `R=AP`, `A=PL`, `C=DE,DO`, `I=GM,TL`

<a id="task-37"></a>
### Task 3.7
Resolve critical data risks and exceptions.

RACI: `R=PL`, `A=PL`, `C=DE,DO,TL`, `I=GM,AP`

<a id="task-38"></a>
### Task 3.8
Approve data baseline for methodology selection.

RACI: `R=TL`, `A=GM`, `C=PL,DE`, `I=AP,DO,DS`

## Domain IV: Methodology (Approach) Framing

<a id="task-41"></a>
### Task 4.1
Define candidate method families and fit criteria.

RACI: `R=AP`, `A=PL`, `C=DS`, `I=GM,TL`

<a id="task-42"></a>
### Task 4.2
Evaluate methods against constraints and mission needs.

RACI: `R=DS`, `A=PL`, `C=AP,DO,TL`, `I=GM`

<a id="task-43"></a>
### Task 4.3
Define architecture and integration approach.

RACI: `R=DO`, `A=PL`, `C=AD,DS`, `I=AP,GM`

<a id="task-44"></a>
### Task 4.4
Approve selected methodology and delivery approach.

RACI: `R=PL`, `A=GM`, `C=DS,TL,AP`, `I=DO,AD`

## Domain V: Analytics/Model Development

<a id="task-51"></a>
### Task 5.1
Prepare development-ready analytic datasets.

RACI: `R=AP`, `A=PL`, `C=DO,DE`, `I=GM`

<a id="task-52"></a>
### Task 5.2
Develop baseline and candidate models.

RACI: `R=DS`, `A=PL`, `C=AP`, `I=GM,TL`

<a id="task-53"></a>
### Task 5.3
Validate model performance and robustness.

RACI: `R=DS`, `A=PL`, `C=AP,TL`, `I=GM`

<a id="task-54"></a>
### Task 5.4
Assess model risk, fairness, and explainability.

RACI: `R=TL`, `A=PL`, `C=DS,AP,DE`, `I=GM`

<a id="task-55"></a>
### Task 5.5
Package model artifacts for deployment.

RACI: `R=DO`, `A=PL`, `C=DS,AD`, `I=AP,GM`

<a id="task-56"></a>
### Task 5.6
Approve model release readiness.

RACI: `R=PL`, `A=GM`, `C=TL,DS`, `I=AP,DO,AD`

## Domain VI: Deployment

<a id="task-61"></a>
### Task 6.1
Finalize deployment plan and operational controls.

RACI: `R=PL`, `A=PL`, `C=DO,AD,TL`, `I=GM,AP`

<a id="task-62"></a>
### Task 6.2
Complete implementation readiness review.

RACI: `R=TL`, `A=PL`, `C=DO,AP`, `I=GM,AD`

<a id="task-63"></a>
### Task 6.3
Authorize production deployment.

RACI: `R=GM`, `A=GM`, `C=PL,TL`, `I=DO,AP,AD`

<a id="task-64"></a>
### Task 6.4
Execute deployment and cutover steps.

RACI: `R=DO`, `A=PL`, `C=AD`, `I=GM,AP,TL`

<a id="task-65"></a>
### Task 6.5
Establish observability and incident workflows.

RACI: `R=DO`, `A=AD`, `C=PL,TL`, `I=GM,AP`

<a id="task-66"></a>
### Task 6.6
Validate deployed solution against acceptance criteria.

RACI: `R=AP`, `A=PL`, `C=TL,DO`, `I=GM,AD`

## Domain VII: Analytics Solution Lifecycle Management

<a id="task-71"></a>
### Task 7.1
Track operational performance and mission outcomes.

RACI: `R=AP`, `A=PL`, `C=DS,DO`, `I=GM,TL`

<a id="task-72"></a>
### Task 7.2
Monitor drift and trigger retraining thresholds.

RACI: `R=DS`, `A=PL`, `C=AP,DO`, `I=GM,TL`

<a id="task-73"></a>
### Task 7.3
Manage change requests and version governance.

RACI: `R=PL`, `A=PL`, `C=TL,AD`, `I=GM,AP,DO`

<a id="task-74"></a>
### Task 7.4
Conduct periodic oversight and compliance reviews.

RACI: `R=TL`, `A=GM`, `C=PL,DE`, `I=AP,DO,DS`

<a id="task-75"></a>
### Task 7.5
Prioritize enhancements and deprecation actions.

RACI: `R=PL`, `A=GM`, `C=AP,TL,DS`, `I=DO,AD`

<a id="task-76"></a>
### Task 7.6
Document closure, sustainment, or retirement decisions.

RACI: `R=PL`, `A=GM`, `C=TL,AD`, `I=AP,DO,DS,DE`
