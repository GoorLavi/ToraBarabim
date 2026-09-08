import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';
import { useAdminSession } from '~/AdminPanel/useAdminSession';

import { AdminCard } from './components/AdminCard/AdminCard';
import * as consts from './consts';
import type { AdminsListPageProps } from './models';
import * as styles from './styles';
import { useAdminUsersList } from './useAdminUsersList';

export const AdminsListPage = styled(({ className }: AdminsListPageProps) => {
  const session = useAdminSession();
  const state = useAdminUsersList();

  return (
    <div className={className}>
      <div className="head">
        <div className="heading">
          <h1 className="title">{consts.HEADING}</h1>
          {state.status !== 'error' && (
            <p className="subheading">{state.status === 'success' ? consts.totalCountLabel(state.total) : consts.LOADING_MESSAGE}</p>
          )}
        </div>
        <Link className="add" to={ADMIN_ROUTES.adminNew}>
          {consts.ADD_ADMIN_LABEL}
        </Link>
      </div>

      {state.status === 'pending' && (
        <div className="list" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          {[0, 1, 2].map((index) => (
            <div key={index} className="skeletonCard">
              <div className="lines">
                <div className="line" />
                <div className="line" />
                <div className="line short" />
                <div className="line pill" />
              </div>
              <div className="actionBlock" />
            </div>
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div className="state error" role="alert">
          <p>{adminErrorMessage(state.error)}</p>
          <button type="button" onClick={state.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      )}

      {state.status === 'success' && state.items.length === 0 && (
        <div className="state empty">
          <p className="headline">{consts.NO_ADMINS_HEADLINE}</p>
          <p className="hint">{consts.NO_ADMINS_HINT}</p>
          <Link className="cta" to={ADMIN_ROUTES.adminNew}>
            {consts.ADD_FIRST_ADMIN_LABEL}
          </Link>
        </div>
      )}

      {state.status === 'success' && state.items.length > 0 && (
        <div className="list">
          {state.items.map((admin) => (
            <AdminCard key={admin.id} admin={admin} isSelf={admin.id === session.data?.id} />
          ))}
        </div>
      )}
    </div>
  );
})`
  ${styles.AdminsListPage}
`;
