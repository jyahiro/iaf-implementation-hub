import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {
  DEFAULT_JURISDICTION,
  JURISDICTION_PROFILES,
  STORAGE_KEY,
  type PrimaryJurisdictionId,
} from './hubJurisdictionTypes';

type HubJurisdictionValue = {
  primaryJurisdiction: PrimaryJurisdictionId;
  setPrimaryJurisdiction: (id: PrimaryJurisdictionId) => void;
  profile: (typeof JURISDICTION_PROFILES)[PrimaryJurisdictionId];
};

const HubJurisdictionContext = createContext<HubJurisdictionValue | null>(null);

function readStored(): PrimaryJurisdictionId {
  if (typeof window === 'undefined') {
    return DEFAULT_JURISDICTION;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && raw in JURISDICTION_PROFILES) {
      return raw as PrimaryJurisdictionId;
    }
  } catch {
    // ignore
  }
  return DEFAULT_JURISDICTION;
}

export function HubJurisdictionProvider({children}: {children: React.ReactNode}): React.JSX.Element {
  const [primaryJurisdiction, setPrimaryJurisdictionState] = useState<PrimaryJurisdictionId>(DEFAULT_JURISDICTION);

  useEffect(() => {
    setPrimaryJurisdictionState(readStored());
  }, []);

  const setPrimaryJurisdiction = useCallback((id: PrimaryJurisdictionId) => {
    setPrimaryJurisdictionState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const profile = JURISDICTION_PROFILES[primaryJurisdiction];

  const value = useMemo(
    () => ({
      primaryJurisdiction,
      setPrimaryJurisdiction,
      profile,
    }),
    [primaryJurisdiction, setPrimaryJurisdiction, profile],
  );

  return <HubJurisdictionContext.Provider value={value}>{children}</HubJurisdictionContext.Provider>;
}

export function useHubJurisdiction(): HubJurisdictionValue {
  const ctx = useContext(HubJurisdictionContext);
  if (!ctx) {
    throw new Error('useHubJurisdiction must be used within HubJurisdictionProvider');
  }
  return ctx;
}

/** Safe for layouts that may render outside the provider during edge tooling. */
export function useHubJurisdictionOptional(): HubJurisdictionValue | null {
  return useContext(HubJurisdictionContext);
}
