---
sidebar_position: 33
---

# Placeholder IAF Task RACI Matrix

This page provides a placeholder RACI mapping and task descriptions for the INFORMS Analytics Framework tasks used by the interactive demo.

## Role Legend

- `SP`: Executive Sponsor
- `PM`: Program Manager
- `AN`: Analyst
- `DE`: Data Engineer
- `DS`: Data Scientist
- `ST`: Data Steward
- `RV`: Reviewer/Oversight
- `AD`: Platform Admin

## RACI Key

- `R`: Responsible
- `A`: Accountable
- `C`: Consulted
- `I`: Informed

## Domain I - Business Problem (Question) Framing

<a id="task-11"></a>
### Task 1.1
Define mission problem and measurable outcomes.

RACI: `R=AN`, `A=SP`, `C=PM,RV`, `I=ST,AD`

<a id="task-12"></a>
### Task 1.2
Identify stakeholders and decision cadence.

RACI: `R=PM`, `A=SP`, `C=AN,RV`, `I=ST,AD`

<a id="task-13"></a>
### Task 1.3
Capture decision criteria and constraints.

RACI: `R=AN`, `A=PM`, `C=RV,ST`, `I=SP,AD`

<a id="task-14"></a>
### Task 1.4
Define scope boundaries and assumptions.

RACI: `R=PM`, `A=PM`, `C=AN,ST`, `I=SP,RV,AD`

<a id="task-15"></a>
### Task 1.5
Confirm governance and approval pathway.

RACI: `R=PM`, `A=SP`, `C=RV,ST`, `I=AN,AD`

<a id="task-16"></a>
### Task 1.6
Approve problem framing brief for execution.

RACI: `R=SP`, `A=SP`, `C=PM,RV`, `I=AN,ST,AD`

## Domain II - Analytics Problem Framing

<a id="task-21"></a>
### Task 2.1
Translate business problem into analytics objectives.

RACI: `R=AN`, `A=PM`, `C=DS`, `I=SP,RV`

<a id="task-22"></a>
### Task 2.2
Define candidate analytical approaches.

RACI: `R=DS`, `A=PM`, `C=AN,DE`, `I=SP,RV`

<a id="task-23"></a>
### Task 2.3
Set success metrics and performance thresholds.

RACI: `R=AN`, `A=PM`, `C=DS,RV`, `I=SP`

<a id="task-24"></a>
### Task 2.4
Document assumptions and trade-offs.

RACI: `R=PM`, `A=PM`, `C=AN,DS,RV`, `I=SP`

<a id="task-25"></a>
### Task 2.5
Select preferred analytics approach.

RACI: `R=DS`, `A=PM`, `C=AN,RV`, `I=SP,DE`

<a id="task-26"></a>
### Task 2.6
Define acceptance criteria for next gate.

RACI: `R=RV`, `A=PM`, `C=AN,DS`, `I=SP`

<a id="task-27"></a>
### Task 2.7
Authorize transition to data readiness activities.

RACI: `R=SP`, `A=SP`, `C=PM,RV`, `I=AN,DS,DE`

## Domain III - Data

<a id="task-31"></a>
### Task 3.1
Inventory data sources and owners.

RACI: `R=ST`, `A=PM`, `C=DE,AN`, `I=SP,RV`

<a id="task-32"></a>
### Task 3.2
Classify data sensitivity and handling requirements.

RACI: `R=ST`, `A=ST`, `C=RV,AD`, `I=PM,SP`

<a id="task-33"></a>
### Task 3.3
Assess data quality and fitness for use.

RACI: `R=ST`, `A=PM`, `C=AN,DE`, `I=SP,RV`

<a id="task-34"></a>
### Task 3.4
Design ingestion, transformation, and lineage flow.

RACI: `R=DE`, `A=PM`, `C=ST,AD`, `I=AN,SP`

<a id="task-35"></a>
### Task 3.5
Implement secure data access and controls.

RACI: `R=DE`, `A=AD`, `C=ST,RV`, `I=PM,SP`

<a id="task-36"></a>
### Task 3.6
Produce data readiness evidence package.

RACI: `R=AN`, `A=PM`, `C=ST,DE`, `I=SP,RV`

<a id="task-37"></a>
### Task 3.7
Resolve critical data risks and exceptions.

RACI: `R=PM`, `A=PM`, `C=ST,DE,RV`, `I=SP,AN`

<a id="task-38"></a>
### Task 3.8
Approve data baseline for methodology selection.

RACI: `R=RV`, `A=SP`, `C=PM,ST`, `I=AN,DE,DS`

## Domain IV - Methodology (Approach) Framing

<a id="task-41"></a>
### Task 4.1
Define candidate method families and fit criteria.

RACI: `R=AN`, `A=PM`, `C=DS`, `I=SP,RV`

<a id="task-42"></a>
### Task 4.2
Evaluate methods against constraints and mission needs.

RACI: `R=DS`, `A=PM`, `C=AN,DE,RV`, `I=SP`

<a id="task-43"></a>
### Task 4.3
Define architecture and integration approach.

RACI: `R=DE`, `A=PM`, `C=AD,DS`, `I=AN,SP`

<a id="task-44"></a>
### Task 4.4
Approve selected methodology and delivery approach.

RACI: `R=PM`, `A=SP`, `C=DS,RV,AN`, `I=DE,AD`

## Domain V - Analytics/Model Development

<a id="task-51"></a>
### Task 5.1
Prepare development-ready analytic datasets.

RACI: `R=AN`, `A=PM`, `C=DE,ST`, `I=SP`

<a id="task-52"></a>
### Task 5.2
Develop baseline and candidate models.

RACI: `R=DS`, `A=PM`, `C=AN`, `I=SP,RV`

<a id="task-53"></a>
### Task 5.3
Validate model performance and robustness.

RACI: `R=DS`, `A=PM`, `C=AN,RV`, `I=SP`

<a id="task-54"></a>
### Task 5.4
Assess model risk, fairness, and explainability.

RACI: `R=RV`, `A=PM`, `C=DS,AN,ST`, `I=SP`

<a id="task-55"></a>
### Task 5.5
Package model artifacts for deployment.

RACI: `R=DE`, `A=PM`, `C=DS,AD`, `I=AN,SP`

<a id="task-56"></a>
### Task 5.6
Approve model release readiness.

RACI: `R=PM`, `A=SP`, `C=RV,DS`, `I=AN,DE,AD`

## Domain VI - Deployment

<a id="task-61"></a>
### Task 6.1
Finalize deployment plan and operational controls.

RACI: `R=PM`, `A=PM`, `C=DE,AD,RV`, `I=SP,AN`

<a id="task-62"></a>
### Task 6.2
Complete implementation readiness review.

RACI: `R=RV`, `A=PM`, `C=DE,AN`, `I=SP,AD`

<a id="task-63"></a>
### Task 6.3
Authorize production deployment.

RACI: `R=SP`, `A=SP`, `C=PM,RV`, `I=DE,AN,AD`

<a id="task-64"></a>
### Task 6.4
Execute deployment and cutover steps.

RACI: `R=DE`, `A=PM`, `C=AD`, `I=SP,AN,RV`

<a id="task-65"></a>
### Task 6.5
Establish observability and incident workflows.

RACI: `R=DE`, `A=AD`, `C=PM,RV`, `I=SP,AN`

<a id="task-66"></a>
### Task 6.6
Validate deployed solution against acceptance criteria.

RACI: `R=AN`, `A=PM`, `C=RV,DE`, `I=SP,AD`

## Domain VII - Analytics Solution Lifecycle Management

<a id="task-71"></a>
### Task 7.1
Track operational performance and mission outcomes.

RACI: `R=AN`, `A=PM`, `C=DS,DE`, `I=SP,RV`

<a id="task-72"></a>
### Task 7.2
Monitor drift and trigger retraining thresholds.

RACI: `R=DS`, `A=PM`, `C=AN,DE`, `I=SP,RV`

<a id="task-73"></a>
### Task 7.3
Manage change requests and version governance.

RACI: `R=PM`, `A=PM`, `C=RV,AD`, `I=SP,AN,DE`

<a id="task-74"></a>
### Task 7.4
Conduct periodic oversight and compliance reviews.

RACI: `R=RV`, `A=SP`, `C=PM,ST`, `I=AN,DE,DS`

<a id="task-75"></a>
### Task 7.5
Prioritize enhancements and deprecation actions.

RACI: `R=PM`, `A=SP`, `C=AN,RV,DS`, `I=DE,AD`

<a id="task-76"></a>
### Task 7.6
Document closure, sustainment, or retirement decisions.

RACI: `R=PM`, `A=SP`, `C=RV,AD`, `I=AN,DE,DS,ST`
