import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { RabbiDirectoryEntry } from '@torabarabim/common';

import { fetchRabbiDirectoryPage, RabbisPageApiError } from './api';
import { RABBI_DIRECTORY_PAGE_SIZE, RABBIS_QUERY_KEYS } from './consts';

// The index draws no pagination control (design spec): the search field
// filters an already-loaded list, so the whole directory loads up front.
// The first page also carries `total`; any remaining pages are independent
// requests and run together rather than one at a time (root CLAUDE.md,
// "Independent async calls run together with Promise.all").
const fetchAllRabbis = async (signal?: AbortSignal): Promise<RabbiDirectoryEntry[]> => {
  const first = await fetchRabbiDirectoryPage(1, RABBI_DIRECTORY_PAGE_SIZE, signal);
  if (first.items.length >= first.total) return first.items;

  const remainingPageCount = Math.ceil(first.total / first.pageSize) - 1;
  const remainingPages = await Promise.all(
    Array.from({ length: remainingPageCount }, (_, index) => fetchRabbiDirectoryPage(index + 2, RABBI_DIRECTORY_PAGE_SIZE, signal)),
  );
  return [...first.items, ...remainingPages.flatMap((page) => page.items)];
};

export const useRabbiDirectory = (): UseQueryResult<RabbiDirectoryEntry[], RabbisPageApiError> =>
  useQuery({
    queryKey: RABBIS_QUERY_KEYS.all(),
    queryFn: ({ signal }) => fetchAllRabbis(signal),
  });
