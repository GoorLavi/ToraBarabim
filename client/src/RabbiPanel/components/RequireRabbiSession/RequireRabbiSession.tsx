import { Navigate, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { RABBI_ROUTES } from '~/RabbiPanel/consts';
import { useRabbiSession } from '~/RabbiPanel/useRabbiSession';

import * as consts from './consts';
import type { RequireRabbiSessionProps } from './models';
import * as styles from './styles';

// The one place `GET /v1/rabbi/me` is checked to gate the whole `/rabbi/*`
// tree. This is UX, not the security boundary: the server enforces the
// rabbi's session on every request regardless.
export const RequireRabbiSession = styled(({ className }: RequireRabbiSessionProps) => {
  const session = useRabbiSession();
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
    const target = new URL(RABBI_ROUTES.login, window.location.origin);
    target.searchParams.set('from', from);
    return <Navigate to={`${target.pathname}${target.search}`} replace />;
  }

  return <Outlet />;
})`
  ${styles.RequireRabbiSession}
`;
