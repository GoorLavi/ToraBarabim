import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { useIdentifyPanelUser } from '~/analytics/useIdentifyPanelUser';
import { PanelTabNav } from '~/components/PanelTabNav/PanelTabNav';
import { rabbiDisplayName } from '~/helpers';
import { RABBI_ROUTES } from '~/RabbiPanel/consts';
import { useRabbiProfile } from '~/RabbiPanel/useRabbiProfile';
import { useRabbiSession } from '~/RabbiPanel/useRabbiSession';

import * as consts from './consts';
import type { RabbiShellProps } from './models';
import * as styles from './styles';
import { useRabbiLogout } from './useRabbiLogout';

// Order is load-bearing below `md`: PanelTabNav's grid fills row by row, so
// this is "מועדים קרובים"/"השיעורים שלי" on row one, "הקורסים שלי"/"הפרטים
// שלי" on row two (design brief B, item 1).
const TAB_ITEMS = [
  { to: RABBI_ROUTES.upcoming, label: consts.TAB_UPCOMING_LABEL, onClick: () => trackEvent(MIXPANEL_EVENTS.panelTabClick, { tab: 'upcoming' }) },
  { to: RABBI_ROUTES.lessons, label: consts.TAB_LESSONS_LABEL, onClick: () => trackEvent(MIXPANEL_EVENTS.panelTabClick, { tab: 'lessons' }) },
  { to: RABBI_ROUTES.courses, label: consts.TAB_COURSES_LABEL, onClick: () => trackEvent(MIXPANEL_EVENTS.panelTabClick, { tab: 'courses' }) },
  { to: RABBI_ROUTES.profile, label: consts.TAB_PROFILE_LABEL, onClick: () => trackEvent(MIXPANEL_EVENTS.panelTabClick, { tab: 'profile' }) },
];

// The greeting reads the rabbi's own profile, not the session record: the
// session's `name` is copied at login and can drift from the profile the
// rabbi has since edited, and it never carries the honorific this greeting
// must show.
export const RabbiShell = styled(({ className }: RabbiShellProps) => {
  const profile = useRabbiProfile();
  const session = useRabbiSession();
  const logout = useRabbiLogout();

  // Only once both reads are the same account's: the previous account's
  // profile can still be cached for a moment after a new login on this tab.
  useIdentifyPanelUser(
    profile.data && session.data && profile.data.id === session.data.rabbiId
      ? { role: 'rabbi', accountId: session.data.id, name: rabbiDisplayName(profile.data), rabbiId: session.data.rabbiId }
      : undefined,
  );

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

          <PanelTabNav {...{ ariaLabel: consts.NAV_LABEL, items: TAB_ITEMS }} />

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
