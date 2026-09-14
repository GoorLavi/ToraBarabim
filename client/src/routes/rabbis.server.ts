import type { RabbiDirectoryResponse } from '@torabarabim/common';

import { RABBI_DIRECTORY_PAGE_SIZE } from '~/RabbisPage/consts';

import { toRabbiDirectoryResponse } from '../../../server/src/convertors/rabbi-directory';
import * as rabbiService from '../../../server/src/service/rabbi/rabbi';
import { DEFAULT_PAGE } from '../../../server/src/service/shared/consts';
import { UNCACHEABLE_ERROR_HEADERS } from './consts';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service and database
// code below is excluded from the browser bundle.
export const loadRabbiDirectory = async (): Promise<RabbiDirectoryResponse> => {
  try {
    const result = await rabbiService.list({ page: DEFAULT_PAGE, pageSize: RABBI_DIRECTORY_PAGE_SIZE });
    return toRabbiDirectoryResponse(result);
  } catch (error) {
    console.error('Failed to load rabbi directory', { error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
