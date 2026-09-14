import type { CityDetailResponse } from '@torabarabim/common';

import { toCityDetailResponse } from '../../../../server/src/convertors/city';
import { CityNotFoundError } from '../../../../server/src/service/city/errors';
import * as cityService from '../../../../server/src/service/city/city';
import { toSlug } from '../../../../server/src/service/shared/slug';
import { UNCACHEABLE_ERROR_HEADERS } from '../consts';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service, database, and
// `toSlug` normalisation below cannot reach the browser bundle.

// `toSlug` is idempotent, and the route this backs used to serve the raw
// Hebrew city name where it now serves that name's slug (route.tsx), so
// normalising the incoming param here lets both shapes resolve to the same
// city; route.tsx compares the raw param against the result's own slug to
// decide whether a redirect is owed.
export const loadCityDetail = async (rawSlug: string): Promise<CityDetailResponse> => {
  try {
    const result = await cityService.resolveBySlug(toSlug(rawSlug));
    return toCityDetailResponse(result);
  } catch (error) {
    if (error instanceof CityNotFoundError) {
      throw new Response('העיר לא נמצאה', { status: 404, headers: UNCACHEABLE_ERROR_HEADERS });
    }
    console.error('Failed to load city detail', { rawSlug, error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
