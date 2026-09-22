import { useQuery } from '@tanstack/react-query';
import type { Rabbi } from '@torabarabim/common';

import { fetchRabbiDirectoryPage } from './api';
import { PLACE_QUERY_KEYS } from './consts';

export interface RabbiDirectoryState {
  items: Rabbi[];
  byId: Map<string, Rabbi>;
  isPending: boolean;
  isError: boolean;
}

// Shared by `LessonsListPage` (resolving each lesson's own `rabbiId` to a
// display name) and `LessonFormPage`'s rabbi picker (choosing one): two real
// callers, so this sits at the panel's top level, mirroring
// `RabbiPanel/useRabbiProfile.ts`. Both audience scopes are fetched, since a
// place may name a rav or a rabbanit. See `api.ts`'s
// `fetchRabbiDirectoryPage` for why this reads the public directory at its
// largest page size instead of a real search.
export const useRabbiDirectory = (): RabbiDirectoryState => {
  const general = useQuery({ queryKey: PLACE_QUERY_KEYS.rabbiDirectory('general'), queryFn: () => fetchRabbiDirectoryPage('general') });
  const women = useQuery({ queryKey: PLACE_QUERY_KEYS.rabbiDirectory('women'), queryFn: () => fetchRabbiDirectoryPage('women') });

  const items: Rabbi[] = [...(general.data?.items ?? []), ...(women.data?.items ?? [])];

  return {
    items,
    byId: new Map(items.map((item) => [item.id, item])),
    isPending: general.isPending || women.isPending,
    isError: general.isError || women.isError,
  };
};
