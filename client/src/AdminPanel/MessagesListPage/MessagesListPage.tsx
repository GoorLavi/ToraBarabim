import type { VisitorMessageStatusFilter } from '@torabarabim/common';
import classNames from 'classnames';
import styled from 'styled-components';

import { adminErrorMessage } from '~/AdminPanel/helpers';

import { MessageCard } from './components/MessageCard/MessageCard';
import * as consts from './consts';
import type { MessagesListPageProps } from './models';
import * as styles from './styles';
import { useAdminVisitorMessagesList } from './useAdminVisitorMessagesList';
import { useMessageListFilter } from './useMessageListFilter';

const emptyHeadline = (status: VisitorMessageStatusFilter, unfilteredTotal: number): string => {
  if (unfilteredTotal === 0) return consts.NO_MESSAGES_HEADLINE;
  return status === 'handled' ? consts.NO_HANDLED_MESSAGES_HEADLINE : consts.NO_UNHANDLED_MESSAGES_HEADLINE;
};

export const MessagesListPage = styled(({ className }: MessagesListPageProps) => {
  const filter = useMessageListFilter();
  const state = useAdminVisitorMessagesList(filter.status);

  return (
    <div className={className}>
      <div className="head">
        <h1 className="title">{consts.HEADING}</h1>
      </div>

      <div className="filters">
        {consts.FILTER_ORDER.map((status) => (
          <button
            key={status}
            type="button"
            className={classNames('chip', { selected: status === filter.status })}
            aria-pressed={status === filter.status}
            onClick={() => filter.select(status)}
          >
            {consts.FILTER_LABELS[status]}
          </button>
        ))}
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
          <p className="headline">{emptyHeadline(filter.status, state.unfilteredTotal)}</p>
          {state.unfilteredTotal > 0 && filter.status === 'unhandled' && (
            <button type="button" className="showAll" onClick={() => filter.select('all')}>
              {consts.FILTER_LABELS.all}
            </button>
          )}
        </div>
      )}

      {state.status === 'success' && state.items.length > 0 && (
        <div className="list">
          {state.items.map((message) => (
            <MessageCard key={message.id} {...{ message }} />
          ))}

          {state.hasLoadMoreError && (
            <p className="loadMoreError" role="alert">
              {consts.LOAD_MORE_ERROR_MESSAGE}
            </p>
          )}

          {state.hasMore && (
            <button type="button" className="loadMore" disabled={state.isLoadingMore} aria-busy={state.isLoadingMore} onClick={state.loadMore}>
              {consts.LOAD_MORE_LABEL}
            </button>
          )}
        </div>
      )}
    </div>
  );
})`
  ${styles.MessagesListPage}
`;
