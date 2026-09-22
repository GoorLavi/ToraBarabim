import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { PlaceSessionUser } from '@torabarabim/common';

import { fetchMe, PlaceApiError } from './api';
import { PLACE_QUERY_KEYS } from './consts';

// The one place the place's own session is checked to gate `/place/*`, read
// by `RequirePlaceSession`. Distinct from `usePlaceProfile`, the full read
// the panel's own screens use, mirroring `RabbiPanel/useRabbiSession.ts` and
// `useRabbiProfile.ts`'s own split.
export const usePlaceSession = (): UseQueryResult<PlaceSessionUser, PlaceApiError> =>
  useQuery({
    queryKey: PLACE_QUERY_KEYS.session(),
    queryFn: fetchMe,
    retry: false,
  });
