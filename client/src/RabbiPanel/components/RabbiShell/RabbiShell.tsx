import classNames from 'classnames';
import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { rabbiDisplayName } from '~/helpers';
import { RABBI_ROUTES } from '~/RabbiPanel/consts';
import { useRabbiProfile } from '~/RabbiPanel/useRabbiProfile';

import * as consts from './consts';
import type { RabbiShellProps } from './models';
import * as styles from './styles';
import { useRabbiLogout } from './useRabbiLogout';

// The greeting reads the rabbi's own profile, not the session record: the
// session's `name` is copied at login and can drift from the profile the
// rabbi has since edited, and it never carries the honorific this greeting
// must show.
export const RabbiShell = styled(({ className }: RabbiShellProps) => {
  const profile = useRabbiProfile();
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
            {profile.data && (
              <span className="name" dir="auto">
                {rabbiDisplayName(profile.data)}
              </span>
            )}
            <button type="button" className="logout" onClick={() => logout.mutate()} disabled={logout.isPending}>
              {consts.LOGOUT_LABEL}
            </button>
          </div>
        </div>

        {logout.isError && (
          <p className="logoutError" role="alert">
            {consts.LOGOUT_ERROR_MESSAGE}
          </p>
        )}
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
})`
  ${styles.RabbiShell}
`;
