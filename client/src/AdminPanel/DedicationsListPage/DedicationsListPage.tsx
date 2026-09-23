import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';

import { DedicationCard } from './components/DedicationCard/DedicationCard';
import * as consts from './consts';
import type { DedicationsListPageProps } from './models';
import * as styles from './styles';
import { useAdminDedicationsList } from './useAdminDedicationsList';

export const DedicationsListPage = styled(({ className }: DedicationsListPageProps) => {
  const state = useAdminDedicationsList();

  return (
    <div className={className}>
      <div className="head">
        <div className="heading">
          <h1 className="title">{consts.HEADING}</h1>
          {state.status === 'success' && <p className="subheading">{consts.totalCountLabel(state.total)}</p>}
        </div>
        <Link className="add" to={ADMIN_ROUTES.dedicationNew}>
          {consts.ADD_DEDICATION_LABEL}
        </Link>
      </div>

      {state.status === 'pending' && (
        <div className="list" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="skeletonCard" />
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
          <p className="headline">{consts.NO_DEDICATIONS_HEADLINE}</p>
          <p className="hint">{consts.NO_DEDICATIONS_HINT}</p>
          <Link className="cta" to={ADMIN_ROUTES.dedicationNew}>
            {consts.ADD_FIRST_DEDICATION_LABEL}
          </Link>
        </div>
      )}

      {state.status === 'success' && state.items.length > 0 && (
        <div className="list">
          {state.items.map((dedication) => (
            <DedicationCard key={dedication.id} dedication={dedication} />
          ))}
        </div>
      )}
    </div>
  );
})`
  ${styles.DedicationsListPage}
`;
