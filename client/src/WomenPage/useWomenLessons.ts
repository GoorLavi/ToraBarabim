import { useLessonListPages } from '~/hooks/useLessonListPages';
import type { LessonListPagesResult } from '~/hooks/useLessonListPages';

import { fetchWomenLessons, WomenPageApiError } from './api';
import { WOMEN_LESSONS_PAGE_SIZE, WOMEN_PAGE_QUERY_KEYS, WOMEN_PAGE_RETRY_LIMIT } from './consts';
import type { WomenLessonsFilters } from './models';

export const useWomenLessons = (filters: WomenLessonsFilters): LessonListPagesResult<WomenPageApiError> =>
  useLessonListPages(
    WOMEN_PAGE_QUERY_KEYS.lessons(filters),
    (page, signal) => fetchWomenLessons({ ...filters, page, pageSize: WOMEN_LESSONS_PAGE_SIZE }, signal),
    true,
    WOMEN_PAGE_RETRY_LIMIT,
  );
