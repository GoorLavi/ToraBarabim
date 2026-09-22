import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { PlaceProfileResponse } from '@torabarabim/common';

import { fetchProfile, PlaceApiError } from './api';
import { PLACE_QUERY_KEYS } from './consts';

// There is no dedicated `/v1/place/me`, unlike the rabbi panel's
// `/v1/rabbi/me` (`RabbiPanel/useRabbiSession.ts`): `GET /v1/place/profile`
// is place-authenticated and 401s exactly the same way a session probe
// would, so it doubles as one here. `RequirePlaceSession` reads this for its
// gate and `PlaceShell` reads it for the greeting; both share the exact
// query key `ProfilePage` fetches with, so there is only ever one request in
// flight for it.
export const usePlaceSession = (): UseQueryResult<PlaceProfileResponse, PlaceApiError> =>
  useQuery({
    queryKey: PLACE_QUERY_KEYS.profile(),
    queryFn: fetchProfile,
    retry: false,
  });
