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
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={RABBI_ROUTES.login} replace state={{ from }} />;
  }

  return <Outlet />;
})`
  ${styles.RequireRabbiSession}
`;
