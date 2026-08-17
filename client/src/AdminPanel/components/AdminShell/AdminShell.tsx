import classNames from 'classnames';
import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { useAdminSession } from '~/AdminPanel/useAdminSession';

import * as consts from './consts';
import type { AdminShellProps } from './models';
import * as styles from './styles';
import { useAdminLogout } from './useAdminLogout';

export const AdminShell = styled(({ className }: AdminShellProps) => {
  const session = useAdminSession();
  const logout = useAdminLogout();

  return (
    <div className={className}>
      <header className="header">
        <div className="bar">
          <div className="brand">
            <span className="wordmark" dir="auto">
              {consts.WORDMARK}
            </span>
            <span className="badge">{consts.ADMIN_BADGE_LABEL}</span>
          </div>

          <nav className="nav" aria-label={consts.NAV_LABEL}>
            <NavLink to={ADMIN_ROUTES.lessons} className={({ isActive }) => classNames('tab', { active: isActive })}>
              {consts.LESSONS_TAB_LABEL}
            </NavLink>
            <NavLink to={ADMIN_ROUTES.rabbis} className={({ isActive }) => classNames('tab', { active: isActive })}>
              {consts.RABBIS_TAB_LABEL}
            </NavLink>
          </nav>

          <div className="account">
            <span className="name" dir="auto">
              {session.data?.name ?? consts.ADMIN_NAME_FALLBACK}
            </span>
            <button type="button" className="logout" onClick={() => logout.mutate()} disabled={logout.isPending}>
              {consts.LOGOUT_LABEL}
            </button>
          </div>
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
})`
  ${styles.AdminShell}
`;
