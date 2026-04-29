import React from 'react';
import HubAssistantLauncher from '@site/src/components/HubAssistant';
import {HubJurisdictionProvider} from '@site/src/context/HubJurisdictionContext';

export default function Root({children}: {children: React.ReactNode}): React.JSX.Element {
  return (
    <HubJurisdictionProvider>
      {children}
      <HubAssistantLauncher />
    </HubJurisdictionProvider>
  );
}
