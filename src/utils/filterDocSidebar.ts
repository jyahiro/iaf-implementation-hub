import type {HubDocMeta, JurisdictionProfile} from '@site/src/context/hubJurisdictionTypes';

type SidebarItem =
  | {
      type: 'doc';
      id: string;
      label?: string;
      [key: string]: unknown;
    }
  | {
      type: 'category';
      label: string;
      items: SidebarItem[];
      collapsed?: boolean;
      link?: unknown;
      [key: string]: unknown;
    }
  | {
      type: 'link';
      href: string;
      label: string;
      [key: string]: unknown;
    }
  | {
      type: string;
      items?: SidebarItem[];
      [key: string]: unknown;
    };

function intersects<T>(a: T[] | undefined, b: T[] | undefined): boolean {
  if (!a?.length || !b?.length) {
    return false;
  }
  const setB = new Set(b);
  return a.some((x) => setB.has(x));
}

function intersectsString(a: string[] | undefined, b: string[] | undefined): boolean {
  if (!a?.length || !b?.length) {
    return false;
  }
  const setB = new Set(b);
  return a.some((x) => setB.has(x));
}

export function isDocVisibleInProfile(meta: HubDocMeta | undefined, profile: JurisdictionProfile): boolean {
  if (!meta) {
    return true;
  }
  if (meta.hub_core) {
    return true;
  }
  const contexts = meta.hub_contexts ?? [];
  const tags = meta.hub_jurisdiction_tags ?? [];

  if (intersectsString(tags, profile.hiddenTags)) {
    return false;
  }
  if (contexts.length === 0) {
    return true;
  }
  return intersects(contexts, profile.allowedContexts);
}

function filterItems(
  items: SidebarItem[] | undefined,
  profile: JurisdictionProfile,
  docMap: Record<string, HubDocMeta>,
): SidebarItem[] {
  if (!items) {
    return [];
  }
  const out: SidebarItem[] = [];
  for (const item of items) {
    if (item.type === 'doc' && typeof item.id === 'string') {
      const meta = docMap[item.id];
      if (isDocVisibleInProfile(meta, profile)) {
        out.push(item);
      }
      continue;
    }
    if (item.type === 'category' && Array.isArray(item.items)) {
      const nested = filterItems(item.items, profile, docMap);
      if (nested.length === 0) {
        continue;
      }
      out.push({...item, items: nested});
      continue;
    }
    if (item.type === 'link') {
      out.push(item);
      continue;
    }
    if (Array.isArray(item.items)) {
      const nested = filterItems(item.items, profile, docMap);
      if (nested.length === 0) {
        continue;
      }
      out.push({...item, items: nested});
      continue;
    }
    out.push(item);
  }
  return out;
}

/** Returns a new sidebar item list filtered by jurisdiction profile (Docusaurus passes `sidebar` as an array). */
export function filterDocSidebarItems(
  sidebar: readonly SidebarItem[] | undefined,
  profile: JurisdictionProfile,
  docMap: Record<string, HubDocMeta>,
): SidebarItem[] {
  return filterItems(sidebar as SidebarItem[] | undefined, profile, docMap);
}
