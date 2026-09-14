import type { CityDirectoryResponse } from '@torabarabim/common';

import { toCityDirectoryResponse } from '../../../server/src/convertors/city';
import * as cityService from '../../../server/src/service/city/city';
import { UNCACHEABLE_ERROR_HEADERS } from './consts';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service and database
// code below is excluded from the browser bundle.
export const loadCityDirectory = async (): Promise<CityDirectoryResponse> => {
  try {
    const result = await cityService.listDirectory();
    return toCityDirectoryResponse(result);
  } catch (error) {
    console.error('Failed to load city directory', { error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
