import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { PlaceProfileResponse } from '@torabarabim/common';

import { fetchProfile, PlaceApiError } from './api';
import { PLACE_QUERY_KEYS } from './consts';

// Shared by `ProfilePage` (its own read/write target), `LessonFormPage` (the
// ownership note needs the place's name) and `PlaceShell` (the greeting):
// three real callers, so this sits at the panel's top level, mirroring
// `RabbiPanel/useRabbiProfile.ts`.
export const usePlaceProfile = (): UseQueryResult<PlaceProfileResponse, PlaceApiError> =>
  useQuery({
    queryKey: PLACE_QUERY_KEYS.profile(),
    queryFn: fetchProfile,
  });
