import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/core/lib/client/exports/useDocusaurusContext';
import useIsBrowser from '@docusaurus/core/lib/client/exports/useIsBrowser';
import React from 'react';
import {useHubJurisdiction} from '@site/src/context/HubJurisdictionContext';

type SiteCustomFields = {hubAppVersion?: string};

/**
 * Small persistent readout of Hub version + active jurisdiction profile (bottom-left).
 */
export default function HubContextChip(): React.JSX.Element | null {
  const isBrowser = useIsBrowser();
  const {siteConfig} = useDocusaurusContext();
  const {profile} = useHubJurisdiction();
  const version = String((siteConfig.customFields as SiteCustomFields | undefined)?.hubAppVersion ?? 'unknown');

  if (!isBrowser) {
    return null;
  }

  return (
    <div className="iaf-hub-context-chip" aria-live="polite">
      <span className="iaf-hub-context-chip__version">Hub {version}</span>
      <span className="iaf-hub-context-chip__sep" aria-hidden>
        ·
      </span>
      <span className="iaf-hub-context-chip__profile" title={profile.subtitle}>
        {profile.label}
      </span>
      <Link className="iaf-hub-context-chip__link" to="/docs/">
        Filter
      </Link>
    </div>
  );
}
