import { Navigate, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { PLACE_ROUTES } from '~/PlacePanel/consts';
import { usePlaceSession } from '~/PlacePanel/usePlaceSession';

import * as consts from './consts';
import type { RequirePlaceSessionProps } from './models';
import * as styles from './styles';

// The one place the place's own session is checked to gate the whole
// `/place/*` tree, mirroring `RabbiPanel/components/RequireRabbiSession`.
// This is UX, not the security boundary: the server enforces the place's
// session on every request regardless.
export const RequirePlaceSession = styled(({ className }: RequirePlaceSessionProps) => {
  const session = usePlaceSession();
  const location = useLocation();

  if (session.isPending) {
    return (
      <div className={className} aria-live="polite">
        <p>{consts.LOADING_MESSAGE}</p>
      </div>
    );
  }

  if (!session.data) {
    // `from` travels as a query param, not router state: `/login` is a
    // top-level route someone can land on directly (a stale bookmark, a
    // fresh tab), where no navigation history exists to carry state.
    const from = `${location.pathname}${location.search}`;
    const target = new URL(PLACE_ROUTES.login, window.location.origin);
    target.searchParams.set('from', from);
    return <Navigate to={`${target.pathname}${target.search}`} replace />;
  }

  return <Outlet />;
})`
  ${styles.RequirePlaceSession}
`;
