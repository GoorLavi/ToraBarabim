import type { AreaDetailResponse } from '@torabarabim/common';

import { toAreaDetailResponse } from '../../../../server/src/convertors/area';
import { AreaNotFoundError } from '../../../../server/src/service/area/errors';
import * as areaService from '../../../../server/src/service/area/area';
import { UNCACHEABLE_ERROR_HEADERS } from '../consts';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service and database
// code below is excluded from the browser bundle.
export const loadAreaDetail = async (slug: string): Promise<AreaDetailResponse> => {
  try {
    const result = await areaService.resolveBySlug(slug);
    return toAreaDetailResponse(result);
  } catch (error) {
    if (error instanceof AreaNotFoundError) {
      throw new Response('האזור לא נמצא', { status: 404, headers: UNCACHEABLE_ERROR_HEADERS });
    }
    console.error('Failed to load area detail', { slug, error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
