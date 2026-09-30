import type { RabbiHonorific } from '@torabarabim/common';
import { useSearchParams } from 'react-router-dom';

import type { AdminCourseStatusFilter } from './models';

export interface RabbiFilterValue {
  id: string;
  name: string;
  honorific: RabbiHonorific;
}

export interface CourseListFiltersState {
  status: AdminCourseStatusFilter;
  rabbi: RabbiFilterValue | undefined;
  search: string;
  selectStatus: (status: AdminCourseStatusFilter) => void;
  selectRabbi: (rabbi: RabbiFilterValue | undefined) => void;
  setSearch: (search: string) => void;
  clear: () => void;
  activeFilterCount: number;
}

const STATUS_PARAM = 'status';
const RABBI_ID_PARAM = 'rabbiId';
const RABBI_NAME_PARAM = 'rabbiName';
const RABBI_HONORIFIC_PARAM = 'rabbiHonorific';
const SEARCH_PARAM = 'q';

const isStatusFilter = (value: string | null): value is AdminCourseStatusFilter =>
  value === 'open' || value === 'full' || value === 'closed';
const isRabbiHonorific = (value: string | null): value is RabbiHonorific => value === 'rav' || value === 'rabbanit';

// A search someone can share lives in the URL, not in component state
// (client/CLAUDE.md, Data and State), the same as `useLessonListFilters`'s
// own reasoning.
export const useCourseListFilters = (): CourseListFiltersState => {
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = searchParams.get(STATUS_PARAM);
  const status: AdminCourseStatusFilter = isStatusFilter(statusParam) ? statusParam : 'all';

  const rabbiId = searchParams.get(RABBI_ID_PARAM);
  const rabbiName = searchParams.get(RABBI_NAME_PARAM);
  const rabbiHonorificParam = searchParams.get(RABBI_HONORIFIC_PARAM);
  const rabbi =
    rabbiId && rabbiName && isRabbiHonorific(rabbiHonorificParam) ? { id: rabbiId, name: rabbiName, honorific: rabbiHonorificParam } : undefined;

  const search = searchParams.get(SEARCH_PARAM) ?? '';

  const selectStatus = (nextStatus: AdminCourseStatusFilter): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextStatus === 'all') next.delete(STATUS_PARAM);
      else next.set(STATUS_PARAM, nextStatus);
      return next;
    });
  };

  const selectRabbi = (nextRabbi: RabbiFilterValue | undefined): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextRabbi) {
        next.set(RABBI_ID_PARAM, nextRabbi.id);
        next.set(RABBI_NAME_PARAM, nextRabbi.name);
        next.set(RABBI_HONORIFIC_PARAM, nextRabbi.honorific);
      } else {
        next.delete(RABBI_ID_PARAM);
        next.delete(RABBI_NAME_PARAM);
        next.delete(RABBI_HONORIFIC_PARAM);
      }
      return next;
    });
  };

  const setSearch = (nextSearch: string): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextSearch) next.set(SEARCH_PARAM, nextSearch);
      else next.delete(SEARCH_PARAM);
      return next;
    });
  };

  const clear = (): void => setSearchParams(new URLSearchParams());

  const activeFilterCount = [status !== 'all', Boolean(rabbi), Boolean(search)].filter(Boolean).length;

  return { status, rabbi, search, selectStatus, selectRabbi, setSearch, clear, activeFilterCount };
};
