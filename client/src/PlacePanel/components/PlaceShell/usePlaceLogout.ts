import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { PLACE_QUERY_KEYS, PLACE_ROUTES } from '~/PlacePanel/consts';

// There is no `POST /v1/place/logout` yet, unlike the rabbi panel's
// `useRabbiLogout.ts` (which calls `/v1/rabbi/logout`), so this cannot end
// the place's httpOnly session cookie server-side: it only drops the
// cached profile query and sends the browser to `/login`. Deliberately
// fail-open until the endpoint exists: the cookie stays valid, on this
// device, until it expires on its own. Flagged in the build report rather
// than left silent, per root CLAUDE.md's "Escalate Before Bending a Rule".
export const usePlaceLogout = (): (() => void) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    queryClient.removeQueries({ queryKey: PLACE_QUERY_KEYS.profile() });
    navigate(PLACE_ROUTES.login, { replace: true });
  };
};
