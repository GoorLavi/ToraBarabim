import { useLessonListPages } from '~/hooks/useLessonListPages';
import type { LessonListPagesResult } from '~/hooks/models';

import { fetchLessons, PlacePageApiError } from './api';
import { PLACE_LESSONS_PAGE_SIZE, PLACE_PAGE_QUERY_KEYS, PLACE_PAGE_RETRY_LIMIT } from './consts';

// "Load more" pages through `page` at a fixed page size, mirroring
// CityPage/useCityLessons.ts exactly.
export const usePlaceLessons = (placeId: string | undefined, enabled: boolean): LessonListPagesResult<PlacePageApiError> =>
  useLessonListPages(
    PLACE_PAGE_QUERY_KEYS.lessons(placeId ?? ''),
    (page, signal) => fetchLessons({ placeId, page, pageSize: PLACE_LESSONS_PAGE_SIZE }, signal),
    enabled && Boolean(placeId),
    PLACE_PAGE_RETRY_LIMIT,
    false,
  );
