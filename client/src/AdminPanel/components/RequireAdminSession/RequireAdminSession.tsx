import { Navigate, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { useAdminSession } from '~/AdminPanel/useAdminSession';

import * as consts from './consts';
import type { RequireAdminSessionProps } from './models';
import * as styles from './styles';

// The one place `GET /v1/admin/me` is checked to gate the whole `/admin/*`
// tree (client/CLAUDE.md: this is UX, not the security boundary, since the
// server enforces the session on every request regardless).
export const RequireAdminSession = styled(({ className }: RequireAdminSessionProps) => {
  const session = useAdminSession();
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
    return <Navigate to={ADMIN_ROUTES.login} replace state={{ from }} />;
  }

  return <Outlet />;
})`
  ${styles.RequireAdminSession}
`;
