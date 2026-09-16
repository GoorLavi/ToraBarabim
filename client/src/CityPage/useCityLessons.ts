import { useLessonListPages } from '~/hooks/useLessonListPages';
import type { LessonListPagesResult } from '~/hooks/models';

import { CityPageApiError, fetchLessons } from './api';
import { CITY_LESSONS_PAGE_SIZE, CITY_PAGE_QUERY_KEYS, CITY_PAGE_RETRY_LIMIT } from './consts';

// `GET /v1/lessons?city=` takes the numeric code, never the name, so this
// cannot start until useCityDetail resolves and hands back `cityCode`. The
// city itself only ever changes through a route navigation, never while
// this call is open, so it has no placeholder state to opt into.
export const useCityLessons = (cityCode: string | undefined, enabled: boolean): LessonListPagesResult<CityPageApiError> =>
  useLessonListPages(
    CITY_PAGE_QUERY_KEYS.lessons(cityCode ?? ''),
    (page, signal) => fetchLessons({ city: cityCode, page, pageSize: CITY_LESSONS_PAGE_SIZE }, signal),
    enabled && Boolean(cityCode),
    CITY_PAGE_RETRY_LIMIT,
    false,
  );
