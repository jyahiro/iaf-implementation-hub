import Link from '@docusaurus/Link';
import React from 'react';

function IconDomains(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} aria-hidden {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 13h6v6H4v-6zm10 0h6v6h-6v-6z"
      />
    </svg>
  );
}

function IconTemplates(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} aria-hidden {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
      />
    </svg>
  );
}

function IconShield(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} aria-hidden {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      />
    </svg>
  );
}

function IconServices(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} aria-hidden {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
      />
    </svg>
  );
}

function IconLifecycle(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} aria-hidden {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2"
      />
    </svg>
  );
}

function IconEvidence(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} aria-hidden {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19.5A2.5 2.5 0 016.5 17H20"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
      />
    </svg>
  );
}

const PILLARS: Array<{title: string; body: string; Icon: typeof IconDomains; to: string}> = [
  {
    title: 'Seven domain standards',
    body: 'IAF Domains I–VII with clear entry/exit criteria and artifacts.',
    Icon: IconDomains,
    to: '/docs/domains/business-problem-framing',
  },
  {
    title: 'Digital templates',
    body: 'Markdown artifacts you can version, review, and link to services.',
    Icon: IconTemplates,
    to: '/docs/public-sector/templates',
  },
  {
    title: 'Legal & policy guardrails',
    body: 'Evidence Act baseline plus checkpoints mapped to IAF gates.',
    Icon: IconShield,
    to: '/docs/legal-policy/compliance-checkpoints',
  },
  {
    title: 'Service catalog',
    body: 'Structured intake aligned to IAF tasks and governance outputs.',
    Icon: IconServices,
    to: '/docs/service-catalog',
  },
  {
    title: 'Lifecycle & audit mindset',
    body: 'Designed for oversight, records, and operational sustainment.',
    Icon: IconLifecycle,
    to: '/docs/domains/lifecycle-management',
  },
  {
    title: 'Evidence-ready delivery',
    body: 'Traceable decisions from framing through deployment and retirement.',
    Icon: IconEvidence,
    to: '/docs/implementation-toolkit/crosswalk',
  },
];

export default function HomeCredibility(): React.JSX.Element {
  return (
    <div className="iaf-home-credibility">
      <div className="iaf-home-credibility__ribbon" role="presentation" />
      <p className="iaf-home-credibility__eyebrow">Public-sector analytics implementation</p>
      <div className="iaf-home-credibility__grid" role="list">
        {PILLARS.map(({title, body, Icon, to}) => (
          <Link key={title} to={to} className="iaf-home-credibility__cardLink" role="listitem">
            <div className="iaf-home-credibility__card">
              <div className="iaf-home-credibility__iconWrap" aria-hidden>
                <Icon className="iaf-home-credibility__icon" />
              </div>
              <div>
                <p className="iaf-home-credibility__cardTitle">
                  {title}
                  <span className="iaf-home-credibility__chevron" aria-hidden>
                    {' '}
                    →
                  </span>
                </p>
                <p className="iaf-home-credibility__cardBody">{body}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
