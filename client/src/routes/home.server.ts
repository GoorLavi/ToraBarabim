import type { HomeResponse } from '@torabarabim/common';

import { toHomeResponse } from '../../../server/src/convertors/home';
import * as homeService from '../../../server/src/service/home/home';
import { UNCACHEABLE_ERROR_HEADERS } from './consts';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service and database
// code below cannot reach the browser bundle.
export const loadHome = async (): Promise<HomeResponse> => {
  try {
    const result = await homeService.getHome(new Date());
    return toHomeResponse(result);
  } catch (error) {
    console.error('Failed to load home rows', { error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
