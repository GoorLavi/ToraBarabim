import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { RabbiProfileResponse } from '@torabarabim/common';

import { fetchProfile, RabbiApiError } from './api';
import { RABBI_QUERY_KEYS } from './consts';

// Shared by `ProfilePage` (its own read/write target) and `LessonFormPage`
// (its live preview card needs the rabbi's name and photo, and a lesson
// form has no rabbi picker to source them from otherwise): two real
// callers, so this sits at the panel's top level rather than under either
// feature's folder.
export const useRabbiProfile = (): UseQueryResult<RabbiProfileResponse, RabbiApiError> =>
  useQuery({
    queryKey: RABBI_QUERY_KEYS.profile(),
    queryFn: fetchProfile,
  });
