import {canAdvanceDomain, getNextDomain} from '@iaf/shared';
import type {DomainStage} from '@iaf/shared';

export class WorkflowEngine {
  advance(stage: DomainStage, approvedArtifactIds: string[], policyPassed: boolean): DomainStage {
    const allRequiredApproved = stage.requiredArtifactTemplateIds.map((templateId) =>
      approvedArtifactIds.includes(templateId) ? 'approved' : 'pending',
    );
    const checklistComplete = stage.checklist.every((item) => item.completed);
    const allowed = canAdvanceDomain(allRequiredApproved, checklistComplete, policyPassed);
    if (!allowed) {
      throw new Error(`Cannot advance domain ${stage.domain}; required artifacts/checklist/policy are incomplete.`);
    }

    const nextDomain = getNextDomain(stage.domain);
    if (!nextDomain) {
      return {
        ...stage,
        status: 'approved',
        approvedAt: new Date().toISOString(),
      };
    }

    return {
      ...stage,
      domain: nextDomain,
      status: 'in_progress',
      approvedAt: new Date().toISOString(),
    };
  }
}
