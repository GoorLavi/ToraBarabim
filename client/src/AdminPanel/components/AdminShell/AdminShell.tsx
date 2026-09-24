import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { useAdminSession } from '~/AdminPanel/useAdminSession';
import { PanelTabNav } from '~/components/PanelTabNav/PanelTabNav';
import type { PanelTabNavItem } from '~/components/PanelTabNav/models';

import * as consts from './consts';
import type { AdminShellProps } from './models';
import * as styles from './styles';
import { useAdminLogout } from './useAdminLogout';

const BASE_TAB_ITEMS: PanelTabNavItem[] = [
  { to: ADMIN_ROUTES.lessons, label: consts.LESSONS_TAB_LABEL },
  { to: ADMIN_ROUTES.rabbis, label: consts.RABBIS_TAB_LABEL },
  { to: ADMIN_ROUTES.places, label: consts.PLACES_TAB_LABEL },
  { to: ADMIN_ROUTES.dedications, label: consts.DEDICATIONS_TAB_LABEL },
];

export const AdminShell = styled(({ className }: AdminShellProps) => {
  const session = useAdminSession();
  const logout = useAdminLogout();

  const tabItems = session.data?.isSuper ? [...BASE_TAB_ITEMS, { to: ADMIN_ROUTES.admins, label: consts.ADMINS_TAB_LABEL }] : BASE_TAB_ITEMS;

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

          <PanelTabNav {...{ ariaLabel: consts.NAV_LABEL, items: tabItems }} />

          <div className="account">
            <span className="name" dir="auto">
              {session.data?.name ?? consts.ADMIN_NAME_FALLBACK}
            </span>
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
  ${styles.AdminShell}
`;
