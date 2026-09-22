import classNames from 'classnames';
import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { PLACE_ROUTES } from '~/PlacePanel/consts';
import { usePlaceSession } from '~/PlacePanel/usePlaceSession';

import * as consts from './consts';
import type { PlaceShellProps } from './models';
import * as styles from './styles';
import { usePlaceLogout } from './usePlaceLogout';

// Two tabs, not three: this panel has nothing like RabbiShell's "upcoming"
// tab, since a place cannot cancel or move a single date (build brief:
// there is no exception surface here at all).
export const PlaceShell = styled(({ className }: PlaceShellProps) => {
  const session = usePlaceSession();
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
            {session.data && (
              <span className="name" dir="auto">
                {session.data.name}
              </span>
            )}
            <button type="button" className="logout" onClick={logout}>
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
  ${styles.PlaceShell}
`;
