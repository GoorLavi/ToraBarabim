import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AudienceScope, RabbiDirectoryEntry } from '@torabarabim/common';

import { fetchRabbiDirectoryPage, RabbisPageApiError } from './api';
import { RABBI_DIRECTORY_PAGE_SIZE, RABBIS_QUERY_KEYS } from './consts';
import type { RabbiDirectory } from './models';

// `rabbis` lists ravs only, `rabbaniyot` lists rabbaniyot only (owner
// decision A3): the one place a `RabbiDirectory` resolves to the wire's
// `AudienceScope`.
const scopeForDirectory = (directory: RabbiDirectory): AudienceScope => (directory === 'rabbaniyot' ? 'women' : 'general');

// The index draws no pagination control (design spec): the search field
// filters an already-loaded list, so the whole directory loads up front.
// The first page also carries `total`; any remaining pages are independent
// requests and run together rather than one at a time (root CLAUDE.md,
// "Independent async calls run together with Promise.all").
const fetchAllRabbis = async (directory: RabbiDirectory, signal?: AbortSignal): Promise<RabbiDirectoryEntry[]> => {
  const scope = scopeForDirectory(directory);
  const first = await fetchRabbiDirectoryPage(1, RABBI_DIRECTORY_PAGE_SIZE, scope, signal);
  if (first.items.length >= first.total) return first.items;

  const remainingPageCount = Math.ceil(first.total / first.pageSize) - 1;
  const remainingPages = await Promise.all(
    Array.from({ length: remainingPageCount }, (_, index) => fetchRabbiDirectoryPage(index + 2, RABBI_DIRECTORY_PAGE_SIZE, scope, signal)),
  );
  return [...first.items, ...remainingPages.flatMap((page) => page.items)];
};

export const useRabbiDirectory = (directory: RabbiDirectory): UseQueryResult<RabbiDirectoryEntry[], RabbisPageApiError> =>
  useQuery({
    queryKey: RABBIS_QUERY_KEYS.directory(directory),
    queryFn: ({ signal }) => fetchAllRabbis(directory, signal),
  });
