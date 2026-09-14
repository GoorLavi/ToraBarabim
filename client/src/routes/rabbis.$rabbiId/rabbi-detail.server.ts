import type { RabbiDetailResponse } from '@torabarabim/common';

import { toRabbiDetailResponse } from '../../../../server/src/convertors/rabbi-directory';
import { RabbiNotFoundError } from '../../../../server/src/service/rabbi/errors';
import * as rabbiService from '../../../../server/src/service/rabbi/rabbi';
import { UNCACHEABLE_ERROR_HEADERS } from '../consts';

// The `.server` suffix is React Router's build-time boundary: a module named
// this way cannot be imported into a client bundle without a build error, so
// the service and database code below is excluded from the browser bundle by
// that mechanism, not by relying on loader-export removal alone.

// A bare thrown Error carries no headers, so the route's `headers()` export
// (which reads `errorHeaders`) has nothing to read on that path; both
// failures here are thrown as a Response carrying `UNCACHEABLE_ERROR_HEADERS`
// instead, so an error response never sits behind the CDN's success caching.

export const loadRabbiDetail = async (rabbiId: string): Promise<RabbiDetailResponse> => {
  try {
    const record = await rabbiService.getById(rabbiId);
    return toRabbiDetailResponse(record);
  } catch (error) {
    if (error instanceof RabbiNotFoundError) {
      throw new Response('רב לא נמצא', { status: 404, headers: UNCACHEABLE_ERROR_HEADERS });
    }
    console.error('Failed to load rabbi detail', { rabbiId, error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
