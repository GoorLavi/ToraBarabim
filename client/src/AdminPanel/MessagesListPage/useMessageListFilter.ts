import type { VisitorMessageStatusFilter } from '@torabarabim/common';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_STATUS_FILTER, STATUS_PARAM } from './consts';
import type { MessageListFilterState } from './models';

const isExplicitStatus = (value: string | null): value is Exclude<VisitorMessageStatusFilter, typeof DEFAULT_STATUS_FILTER> =>
  value === 'handled' || value === 'all';

// The filter is shareable, so it lives in the URL (client/CLAUDE.md, Data and
// State). The default is the absence of the param, which keeps the plain
// `/admin/messages` link meaning "what still waits".
export const useMessageListFilter = (): MessageListFilterState => {
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = searchParams.get(STATUS_PARAM);
  const status = isExplicitStatus(statusParam) ? statusParam : DEFAULT_STATUS_FILTER;

  const select = (nextStatus: VisitorMessageStatusFilter): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextStatus === DEFAULT_STATUS_FILTER) next.delete(STATUS_PARAM);
      else next.set(STATUS_PARAM, nextStatus);
      return next;
    });
  };

  return { status, select };
};
