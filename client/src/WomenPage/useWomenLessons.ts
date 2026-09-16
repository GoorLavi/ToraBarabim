import { useLessonListPages } from '~/hooks/useLessonListPages';
import type { LessonListPagesResult } from '~/hooks/models';

import { fetchWomenLessons, WomenPageApiError } from './api';
import { WOMEN_LESSONS_PAGE_SIZE, WOMEN_PAGE_QUERY_KEYS, WOMEN_PAGE_RETRY_LIMIT } from './consts';
import type { WomenLessonsFilters } from './models';

// The filters (a city, a date, a search term) can change while the page is
// open, so `keepPrevious` stays on: the previous filter's cards stay up
// instead of blanking the screen while the new one loads.
export const useWomenLessons = (filters: WomenLessonsFilters): LessonListPagesResult<WomenPageApiError> =>
  useLessonListPages(
    WOMEN_PAGE_QUERY_KEYS.lessons(filters),
    (page, signal) => fetchWomenLessons({ ...filters, page, pageSize: WOMEN_LESSONS_PAGE_SIZE }, signal),
    true,
    WOMEN_PAGE_RETRY_LIMIT,
    true,
  );
