import {POLICY_PACK} from './policyPack';

export interface PolicyEvaluationResult {
  controlId: string;
  passed: boolean;
  missingEvidence: string[];
}

export function evaluatePolicyForDomain(
  domain: string,
  evidence: Record<string, unknown>,
): PolicyEvaluationResult[] {
  return POLICY_PACK.filter((control) => control.domainScope.includes(domain)).map((control) => {
    const missingEvidence = control.requiredEvidenceKeys.filter((key) => !(key in evidence));
    return {
      controlId: control.id,
      passed: missingEvidence.length === 0,
      missingEvidence,
    };
  });
}

export function overallPass(results: PolicyEvaluationResult[]): boolean {
  return results.every((result) => result.passed);
}
