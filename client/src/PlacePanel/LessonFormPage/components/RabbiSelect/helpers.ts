import type { Rabbi } from '@torabarabim/common';

import { rabbiDisplayName } from '~/helpers';

// Client-side filtering over an already-fetched page, not a server search:
// see `PlacePanel/api.ts`'s `fetchRabbiDirectoryPage` for why there is no
// query round trip here.
export const filterRabbisByName = (items: Rabbi[], query: string): Rabbi[] => {
  const trimmed = query.trim();
  if (!trimmed) return items;
  return items.filter((item) => rabbiDisplayName(item).includes(trimmed));
};
