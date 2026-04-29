import React from 'react';
import clsx from 'clsx';
import {JURISDICTION_PROFILES, type PrimaryJurisdictionId} from '@site/src/context/hubJurisdictionTypes';
import {useHubJurisdiction} from '@site/src/context/HubJurisdictionContext';

const OPTIONS = (Object.keys(JURISDICTION_PROFILES) as PrimaryJurisdictionId[]).map((id) => {
  const p = JURISDICTION_PROFILES[id];
  return {
    id,
    label: p.label,
    subtitle: p.subtitle,
    relationship: p.relationship,
  };
});

type Props = {
  variant?: 'default' | 'compact';
};

export default function JurisdictionSelector({variant = 'default'}: Props): React.JSX.Element {
  const {primaryJurisdiction, setPrimaryJurisdiction, profile} = useHubJurisdiction();

  return (
    <section
      className={clsx(
        'margin-bottom--lg',
        variant === 'compact' ? 'padding-vert--sm' : 'padding-vert--md',
      )}
      style={{
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: '8px',
        padding: variant === 'compact' ? '0.75rem 1rem' : '1rem 1.25rem',
        background: 'var(--ifm-background-surface-color)',
      }}
      aria-labelledby="hub-jurisdiction-heading">
      <h2 id="hub-jurisdiction-heading" className="text--truncate" style={{fontSize: variant === 'compact' ? '1.05rem' : '1.15rem'}}>
        Primary jurisdiction
      </h2>
      <p className="margin-bottom--sm" style={{fontSize: '0.9rem', color: 'var(--ifm-color-content-secondary)'}}>
        Choose how you relate to the <strong>data asset</strong> this Hub describes. The sidebar hides only items tagged in frontmatter as out-of-scope for your selection (for example, NARA disposition depth for a local health profile).
      </p>
      <label className="margin-bottom--xs" style={{display: 'block', fontWeight: 600}} htmlFor="hub-primary-jurisdiction">
        Use case filter
      </label>
      <select
        id="hub-primary-jurisdiction"
        className={clsx('button--block', variant === 'compact' && 'margin-bottom--sm')}
        style={{
          maxWidth: '100%',
          width: 'min(520px, 100%)',
          padding: '0.45rem 0.6rem',
          borderRadius: '6px',
          border: '1px solid var(--ifm-color-emphasis-300)',
          background: 'var(--ifm-background-color)',
          color: 'var(--ifm-font-color-base)',
        }}
        value={primaryJurisdiction}
        onChange={(event) => setPrimaryJurisdiction(event.target.value as PrimaryJurisdictionId)}>
        {OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <p className="margin-top--sm margin-bottom--none" style={{fontSize: '0.88rem'}}>
        <strong>Active profile:</strong> {profile.subtitle}
      </p>
      <p className="margin-top--xs margin-bottom--none" style={{fontSize: '0.82rem', color: 'var(--ifm-color-content-secondary)'}}>
        <strong>Relationship to data:</strong> {profile.relationship}
      </p>
    </section>
  );
}
