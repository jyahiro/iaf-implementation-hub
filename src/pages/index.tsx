import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import JurisdictionSelector from '@site/src/components/JurisdictionSelector';

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

        <BrowserOnly fallback={<div className="margin-bottom--md" />}>{() => <JurisdictionSelector variant="compact" />}</BrowserOnly>

        <h2>Start by role (TDSP)</h2>
        <p>
          Analytics product roles follow the Microsoft Team Data Science Process (TDSP). Open any card for responsibilities
          and how each role maps to hub keys and RACI codes.
        </p>
        <div style={cardStyle}>
          <h3>Group Manager</h3>
          <p>Own outcomes, priorities, and major governance authorizations.</p>
          <Link to="/docs/start-here/by-role#group-manager">Open role guidance</Link>
        </div>
        <div style={cardStyle}>
          <h3>Team Lead</h3>
          <p>Lead execution quality, reviews, and readiness across TDSP stages.</p>
          <Link to="/docs/start-here/by-role#team-lead">Open role guidance</Link>
        </div>
        <div style={cardStyle}>
          <h3>Project Lead</h3>
          <p>Drive scope, metrics, stakeholder alignment, and cross-domain delivery.</p>
          <Link to="/docs/start-here/by-role#project-lead">Open role guidance</Link>
        </div>
        <div style={cardStyle}>
          <h3>Data Scientist</h3>
          <p>Model, experiment, validate, and define monitoring and retraining criteria.</p>
          <Link to="/docs/start-here/by-role#data-scientist">Open role guidance</Link>
        </div>
        <div style={cardStyle}>
          <h3>DevOps Engineer</h3>
          <p>Pipelines, deployment, observability, and operational controls for releases.</p>
          <Link to="/docs/start-here/by-role#devops-engineer">Open role guidance</Link>
        </div>
        <div style={cardStyle}>
          <h3>Application Developer</h3>
          <p>Integrate analytics into applications, APIs, and mission workflows.</p>
          <Link to="/docs/start-here/by-role#application-developer">Open role guidance</Link>
        </div>
        <div style={cardStyle}>
          <h3>Data Engineer</h3>
          <p>Data acquisition, quality, lineage, and governance-aligned data products.</p>
          <Link to="/docs/start-here/by-role#data-engineer">Open role guidance</Link>
        </div>
        <div style={cardStyle}>
          <h3>Platform Admin</h3>
          <p>Platform identity, access, audit, and operational guardrails for the hub.</p>
          <Link to="/docs/start-here/by-role#platform-admin">Open role guidance</Link>
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
