import React from 'react';
import HubAssistantLauncher from '@site/src/components/HubAssistant';
import HubContextChip from '@site/src/components/HubContextChip';
import {HubJurisdictionProvider} from '@site/src/context/HubJurisdictionContext';

export default function Root({children}: {children: React.ReactNode}): React.JSX.Element {
  return (
    <HubJurisdictionProvider>
      {children}
      <HubContextChip />
      <HubAssistantLauncher />
    </HubJurisdictionProvider>
  );
}
