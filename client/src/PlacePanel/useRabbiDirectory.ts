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

// Resolves each lesson's own `rabbiId` back to a display name for
// `LessonsListPage`. Both audience scopes are fetched, since a place may
// host a rav or a rabbanit. Unlike the picker's own
// `LessonFormPage/components/RabbiSelect/useRabbiSearch.ts`, this asks no
// `q` and so still reads the public directory at its largest page size per
// scope (`api.ts`'s `fetchRabbiDirectoryPage`): a rabbi past the fiftieth in
// either scope has no name shown here (see `LessonListItem/models.ts`).
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
