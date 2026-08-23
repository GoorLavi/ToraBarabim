import classNames from 'classnames';
import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { RABBI_ROUTES } from '~/RabbiPanel/consts';
import { useRabbiSession } from '~/RabbiPanel/useRabbiSession';

import * as consts from './consts';
import type { RabbiShellProps } from './models';
import * as styles from './styles';
import { useRabbiLogout } from './useRabbiLogout';

export const RabbiShell = styled(({ className }: RabbiShellProps) => {
  const session = useRabbiSession();
  const logout = useRabbiLogout();

  return (
    <div className={className}>
      <header className="header">
        <div className="bar">
          <div className="brand">
            <span className="wordmark" dir="auto">
              {consts.WORDMARK}
            </span>
            <span className="badge">{consts.BADGE_LABEL}</span>
          </div>

          <nav className="nav" aria-label={consts.NAV_LABEL}>
            <NavLink to={RABBI_ROUTES.upcoming} className={({ isActive }) => classNames('tab', { active: isActive })}>
              {consts.TAB_UPCOMING_LABEL}
            </NavLink>
            <NavLink to={RABBI_ROUTES.lessons} className={({ isActive }) => classNames('tab', { active: isActive })}>
              {consts.TAB_LESSONS_LABEL}
            </NavLink>
            <NavLink to={RABBI_ROUTES.profile} className={({ isActive }) => classNames('tab', { active: isActive })}>
              {consts.TAB_PROFILE_LABEL}
            </NavLink>
          </nav>

          <div className="account">
            {session.data && (
              <span className="name" dir="auto">
                {session.data.name}
              </span>
            )}
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
  ${styles.RabbiShell}
`;
