import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/core/lib/client/exports/useDocusaurusContext';
import {DEMO_JURISDICTION_COPY} from '@site/src/data/demoJurisdictionCopy';
import {useHubJurisdiction} from '@site/src/context/HubJurisdictionContext';

type SiteCustomFields = {hubAppVersion?: string};

type Props = {
  /** Tighter spacing when embedded above the interactive demo */
  variant?: 'default' | 'compact';
};

export default function DemoJurisdictionBanner({variant = 'default'}: Props): React.JSX.Element {
  const {profile, primaryJurisdiction} = useHubJurisdiction();
  const {siteConfig} = useDocusaurusContext();
  const version = String((siteConfig.customFields as SiteCustomFields | undefined)?.hubAppVersion ?? 'unknown');
  const copy = DEMO_JURISDICTION_COPY[primaryJurisdiction];

  return (
    <div
      className={`alert alert--secondary ${variant === 'compact' ? 'margin-bottom--sm' : 'margin-bottom--md'}`}
      role="region"
      aria-label="Primary jurisdiction context for this demo">
      <p className="margin-bottom--xs" style={{fontWeight: 650}}>
        {copy.headline}
        <span style={{fontWeight: 500, color: 'var(--ifm-color-content-secondary)'}}>
          {' '}
          · Hub <code>{version}</code> · Profile: <code>{profile.label}</code>
        </span>
      </p>
      <ul className="margin-bottom--xs" style={{fontSize: '0.92rem'}}>
        {copy.bullets.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      <p className="margin-bottom--none" style={{fontSize: '0.85rem'}}>
        Change the <strong>Primary jurisdiction</strong> on the{' '}
        <Link to="/docs/">documentation home</Link> (or site home) to refilter the sidebar; this banner updates automatically.
      </p>
    </div>
  );
}
