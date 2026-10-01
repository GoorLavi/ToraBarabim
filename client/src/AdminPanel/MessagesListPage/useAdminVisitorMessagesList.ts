import { useInfiniteQuery } from '@tanstack/react-query';
import type { AdminVisitorMessage, VisitorMessageStatusFilter } from '@torabarabim/common';

import { AdminApiError, fetchAdminVisitorMessages } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS, MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';

export type AdminVisitorMessagesListState =
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | {
      status: 'success';
      items: AdminVisitorMessage[];
      // Every message under every filter: it is what tells "none at all"
      // from "none under this filter".
      unfilteredTotal: number;
      hasMore: boolean;
      isLoadingMore: boolean;
      hasLoadMoreError: boolean;
      loadMore: () => void;
    };

export const useAdminVisitorMessagesList = (status: VisitorMessageStatusFilter): AdminVisitorMessagesListState => {
  const filters = { status, pageSize: MAX_ADMIN_PAGE_SIZE };
  const query = useInfiniteQuery({
    queryKey: ADMIN_QUERY_KEYS.visitorMessages(filters),
    queryFn: ({ pageParam }) => fetchAdminVisitorMessages({ ...filters, before: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  if (query.isPending) return { status: 'pending' };
  if (!query.data) {
    const error = query.error instanceof AdminApiError ? query.error : new AdminApiError(0, undefined, 'visitor messages list failed without an API error');
    return { status: 'error', error, retry: () => void query.refetch() };
  }

  const lastPage = query.data.pages.at(-1);
  return {
    status: 'success',
    items: query.data.pages.flatMap((page) => page.items),
    unfilteredTotal: lastPage?.unfilteredTotal ?? 0,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    hasLoadMoreError: query.isFetchNextPageError,
    loadMore: () => void query.fetchNextPage(),
  };
};
