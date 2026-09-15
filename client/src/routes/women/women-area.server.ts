import type { WomenAreaResponse } from '@torabarabim/common';

import { toWomenAreaResponse } from '../../../../server/src/convertors/women-area';
import * as homeService from '../../../../server/src/service/home/home';
import { UNCACHEABLE_ERROR_HEADERS } from '../consts';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service and database
// code below is excluded from the browser bundle.
export const loadWomenAreaSummary = async (): Promise<WomenAreaResponse> => {
  try {
    const result = await homeService.getWomenArea(new Date());
    return toWomenAreaResponse(result);
  } catch (error) {
    console.error('Failed to load women area summary', { error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
