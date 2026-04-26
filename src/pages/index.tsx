import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1rem',
};

export default function Home(): React.JSX.Element {
  return (
    <Layout title="IAF Implementation Hub" description="Public-sector analytics implementation platform">
      <main className="container margin-vert--lg">
        <h1>IAF Implementation Hub</h1>
        <p>
          End-to-end analytics workflow for public-sector teams: domain standards, digital artifacts,
          service pathways, and legal/policy guardrails.
        </p>

        <h2>Start by Role</h2>
        <div style={cardStyle}>
          <h3>Executive Sponsor</h3>
          <p>Set strategic outcomes, approvals, and governance direction.</p>
          <Link to="/docs/start-here/by-role#executive-sponsor">Open role guidance</Link>
        </div>
        <div style={cardStyle}>
          <h3>Program Manager</h3>
          <p>Drive delivery milestones, artifact completion, and service coordination.</p>
          <Link to="/docs/start-here/by-role#program-manager">Open role guidance</Link>
        </div>
        <div style={cardStyle}>
          <h3>Analyst / Data Team</h3>
          <p>Build evidence, prepare data, develop models, and document decisions.</p>
          <Link to="/docs/start-here/by-role#analyst-and-data-team">Open role guidance</Link>
        </div>
        <div style={cardStyle}>
          <h3>Reviewer / Oversight</h3>
          <p>Validate compliance, controls, and readiness at each domain gate.</p>
          <Link to="/docs/start-here/by-role#reviewer-and-oversight">Open role guidance</Link>
        </div>

        <h2>Core Actions</h2>
        <ul>
          <li>
            <Link to="/docs/start-here">Start here</Link>
          </li>
          <li>
            <Link to="/docs/domains/business-problem-framing">Open Domain Standards</Link>
          </li>
          <li>
            <Link to="/docs/implementation-toolkit">Use the Implementation Toolkit</Link>
          </li>
          <li>
            <Link to="/docs/legal-policy/compliance-checkpoints">Review Legal and Policy Checkpoints</Link>
          </li>
        </ul>
      </main>
    </Layout>
  );
}
