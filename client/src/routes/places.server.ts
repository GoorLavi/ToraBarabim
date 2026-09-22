import type { PlaceListResponse } from '@torabarabim/common';

import { toPlaceListResponse } from '../../../server/src/convertors/place-directory';
import * as placeService from '../../../server/src/service/place/place';
import { UNCACHEABLE_ERROR_HEADERS } from './consts';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service and database
// code below is excluded from the browser bundle. `placeService.list` is
// already every active place, unfiltered and unpaged (it backs an admin
// picker, not a search surface), so there is no page size to thread through.
export const loadPlaceDirectory = async (): Promise<PlaceListResponse> => {
  try {
    const result = await placeService.list();
    return toPlaceListResponse(result);
  } catch (error) {
    console.error('Failed to load place directory', { error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
