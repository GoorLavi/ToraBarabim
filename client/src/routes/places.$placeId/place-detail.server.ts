import type { LessonSearchResponse, PlaceDetailResponse } from '@torabarabim/common';

import { toLessonSearchResponse } from '../../../../server/src/convertors/lesson';
import { toPlaceDetailResponse } from '../../../../server/src/convertors/place-directory';
import * as lessonService from '../../../../server/src/service/lesson/lesson';
import { PlaceNotFoundError } from '../../../../server/src/service/place/errors';
import * as placeService from '../../../../server/src/service/place/place';
import { UNCACHEABLE_ERROR_HEADERS } from '../consts';
import { PLACE_LESSONS_PAGE_SIZE } from './consts';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service and database
// code below is excluded from the browser bundle.

export interface PlaceRouteData {
  place: PlaceDetailResponse;
  occurrences: LessonSearchResponse;
}

// The two loads are independent (neither depends on the other's result), so
// they run together with `Promise.all` rather than in sequence. The search
// itself only ever resolves the recurrences the service already expanded
// for its own window; it never expands one itself. `scope: 'general'`
// because this is a public page open to anyone, the same default
// rabbis.server.ts and cities.server.ts use for their own public directory
// loads: a rabbanit's lesson at this place is excluded from the count and
// the list here, the same exposure policy every other general surface on
// the site already applies (`isLessonInScope`, decision 0026).
export const loadPlaceDetail = async (placeId: string, now: Date): Promise<PlaceRouteData> => {
  try {
    const [record, searchResult] = await Promise.all([
      placeService.getById(placeId),
      lessonService.search({ scope: 'general', placeId, status: 'scheduled', page: 1, pageSize: PLACE_LESSONS_PAGE_SIZE }, now),
    ]);
    return { place: toPlaceDetailResponse(record), occurrences: toLessonSearchResponse(searchResult) };
  } catch (error) {
    if (error instanceof PlaceNotFoundError) {
      throw new Response('המקום לא נמצא', { status: 404, headers: UNCACHEABLE_ERROR_HEADERS });
    }
    console.error('Failed to load place detail', { placeId, error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
