import React from 'react';
import OriginalDocSidebar from '@theme-original/DocSidebar';
import type {Props} from '@theme/DocSidebar';
import {useHubJurisdictionOptional} from '@site/src/context/HubJurisdictionContext';
import {DEFAULT_JURISDICTION, JURISDICTION_PROFILES} from '@site/src/context/hubJurisdictionTypes';
import {filterDocSidebarItems} from '@site/src/utils/filterDocSidebar';
import type {HubDocMeta} from '@site/src/context/hubJurisdictionTypes';
import docMap from '@site/src/data/hubDocContext.generated.json';

export default function DocSidebar(props: Props): React.JSX.Element {
  const hub = useHubJurisdictionOptional();
  const profile = hub?.profile ?? JURISDICTION_PROFILES[DEFAULT_JURISDICTION];
  const filtered = filterDocSidebarItems(props.sidebar, profile, docMap as Record<string, HubDocMeta>);
  return <OriginalDocSidebar {...props} sidebar={filtered} />;
}
