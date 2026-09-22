import classNames from 'classnames';
import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { PLACE_ROUTES } from '~/PlacePanel/consts';
import { usePlaceProfile } from '~/PlacePanel/usePlaceProfile';

import * as consts from './consts';
import type { PlaceShellProps } from './models';
import * as styles from './styles';
import { usePlaceLogout } from './usePlaceLogout';

// Two tabs, not three: this panel has nothing like RabbiShell's "upcoming"
// tab, since a place cannot cancel or move a single date (build brief:
// there is no exception surface here at all). The greeting reads the
// place's own profile, not the session record, mirroring
// `RabbiShell`'s reasoning: it should not go stale the moment the place
// edits its name.
export const PlaceShell = styled(({ className }: PlaceShellProps) => {
  const profile = usePlaceProfile();
  const logout = usePlaceLogout();

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
            <NavLink
              to={PLACE_ROUTES.lessons}
              className={({ isActive }) => classNames('tab', { active: isActive })}
              onClick={() => trackEvent(MIXPANEL_EVENTS.panelTabClick, { tab: 'lessons' })}
            >
              {consts.TAB_LESSONS_LABEL}
            </NavLink>
            <NavLink
              to={PLACE_ROUTES.profile}
              className={({ isActive }) => classNames('tab', { active: isActive })}
              onClick={() => trackEvent(MIXPANEL_EVENTS.panelTabClick, { tab: 'profile' })}
            >
              {consts.TAB_PROFILE_LABEL}
            </NavLink>
          </nav>

          <div className="account">
            {profile.data && (
              <span className="name" dir="auto">
                {profile.data.name}
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
  ${styles.PlaceShell}
`;
