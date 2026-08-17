import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';

import { RabbiCard } from './components/RabbiCard/RabbiCard';
import * as consts from './consts';
import type { RabbisListPageProps } from './models';
import * as styles from './styles';
import { useAdminRabbisList } from './useAdminRabbisList';
import { useRabbiSearchTerm } from './useRabbiSearchTerm';

export const RabbisListPage = styled(({ className }: RabbisListPageProps) => {
  const { search, setSearch } = useRabbiSearchTerm();
  const state = useAdminRabbisList(search);

  return (
    <div className={className}>
      <div className="head">
        <div className="heading">
          <h1 className="title">{consts.HEADING}</h1>
          {state.status === 'success' && <p className="subheading">{consts.totalCountLabel(state.total)}</p>}
        </div>
        <Link className="add" to={ADMIN_ROUTES.rabbiNew}>
          {consts.ADD_RABBI_LABEL}
        </Link>
      </div>

      <div className="filters">
        <span className="sort">{consts.SORT_LABEL}</span>
        <input
          type="search"
          className="search"
          dir="auto"
          aria-label={consts.SEARCH_LABEL}
          placeholder={consts.SEARCH_PLACEHOLDER}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {state.status === 'pending' && (
        <div className="list" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="skeletonCard">
              <div className="thumb" />
              <div className="lines">
                <div className="line" />
                <div className="line short" />
              </div>
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

      {state.status === 'success' && state.rows.length === 0 && !search.trim() && (
        <div className="state empty">
          <p className="headline">{consts.NO_RABBIS_HEADLINE}</p>
          <p className="hint">{consts.NO_RABBIS_HINT}</p>
          <Link className="cta" to={ADMIN_ROUTES.rabbiNew}>
            {consts.ADD_FIRST_RABBI_LABEL}
          </Link>
        </div>
      )}

      {state.status === 'success' && state.rows.length === 0 && Boolean(search.trim()) && (
        <div className="state empty">
          <p className="headline">{consts.NO_MATCHING_RABBIS_HEADLINE}</p>
          <p className="hint">{consts.NO_MATCHING_RABBIS_HINT}</p>
          <button type="button" className="cta" onClick={() => setSearch('')}>
            {consts.CLEAR_SEARCH_LABEL}
          </button>
        </div>
      )}

      {state.status === 'success' && state.rows.length > 0 && (
        <div className="list">
          {state.rows.map((row) => (
            <RabbiCard key={row.rabbi.id} row={row} />
          ))}
        </div>
      )}
    </div>
  );
})`
  ${styles.RabbisListPage}
`;
