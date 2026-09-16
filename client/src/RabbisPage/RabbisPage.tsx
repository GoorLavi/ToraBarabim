import { useState } from 'react';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { StateCard } from '~/components/StateCard/StateCard';

import { RabbiListRow } from './components/RabbiListRow/RabbiListRow';
import { RabbiListRowSkeleton } from './components/RabbiListRowSkeleton/RabbiListRowSkeleton';
import { RabbiSearchField } from './components/RabbiSearchField/RabbiSearchField';
import * as consts from './consts';
import { filterRabbisByName, rabbiCountLabel, rabbiMatchCountLabel } from './helpers';
import type { RabbisPageProps } from './models';
import * as styles from './styles';
import { useRabbiDirectory } from './useRabbiDirectory';

export const RabbisPage = styled(({ className, directory }: RabbisPageProps) => {
  const query = useRabbiDirectory(directory);
  const [search, setSearch] = useState('');
  const copy = consts.DIRECTORY_COPY[directory];

  const rabbis = query.data ?? [];
  const isBoardEmpty = query.isSuccess && rabbis.length === 0;
  const trimmedSearch = search.trim();
  const filteredRabbis = filterRabbisByName(rabbis, trimmedSearch);
  const hasNoResults = query.isSuccess && !isBoardEmpty && trimmedSearch !== '' && filteredRabbis.length === 0;
  const isSearchActive = trimmedSearch !== '' && !hasNoResults;
  const subline = hasNoResults
    ? consts.NO_RESULTS_SUBLINE
    : isSearchActive
      ? rabbiMatchCountLabel(filteredRabbis)
      : `${rabbiCountLabel(rabbis.length, directory)} · ${consts.ORDER_LABEL}`;

  return (
    <main className={className}>
      <div className="titleBlock">
        {query.isPending ? (
          <>
            <span className="headingBar" />
            <span className="subBar" />
          </>
        ) : (
          <>
            <h1 className="heading">{copy.pageTitle}</h1>
            {!query.isError && !isBoardEmpty && (
              <p className="sub">{subline}</p>
            )}
          </>
        )}
      </div>

      {!query.isPending && !query.isError && !isBoardEmpty && (
        <div className="searchField">
          <label className="searchLabel" htmlFor={consts.SEARCH_FIELD_ID}>
            {copy.searchFieldLabel}
          </label>
          <RabbiSearchField
            {...{ id: consts.SEARCH_FIELD_ID, value: search, onChange: setSearch, ariaLabel: copy.searchInputAriaLabel }}
            className="search"
          />
        </div>
      )}

      {query.isPending && (
        <ul className="skeletonList">
          {consts.ROW_SKELETON_KEYS.map((key) => (
            <li key={key}>
              <RabbiListRowSkeleton />
            </li>
          ))}
        </ul>
      )}

      {query.isError && (
        <StateCard
          variant="surface"
          headingLevel="h2"
          heading={copy.loadErrorHeading}
          body={consts.LOAD_ERROR_BODY}
          action={{
            actionLabel: consts.RETRY_LABEL,
            actionStyle: 'primary',
            onAction: () => {
              trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'rabbisPage' });
              query.refetch();
            },
          }}
        />
      )}

      {query.isSuccess && isBoardEmpty && (
        <StateCard
          variant="empty"
          headingLevel="h2"
          heading={copy.boardEmptyHeading}
          body={copy.boardEmptyBody}
          action={{ actionLabel: consts.CONTACT_US_LABEL, actionStyle: 'primary', actionTo: '/contact' }}
        />
      )}

      {query.isSuccess && !isBoardEmpty && hasNoResults && (
        <StateCard
          variant="surface"
          headingLevel="h2"
          heading={
            <>
              {copy.noResultsHeadingPrefix}
              <span dir="auto">{trimmedSearch}</span>
              {copy.noResultsHeadingSuffix}
            </>
          }
          body={consts.NO_RESULTS_BODY}
          action={{ actionLabel: consts.CLEAR_SEARCH_LABEL, actionStyle: 'quiet', onAction: () => setSearch('') }}
        />
      )}

      {query.isSuccess && !isBoardEmpty && !hasNoResults && (
        <ul className="list">
          {filteredRabbis.map((rabbi, index) => (
            <li key={rabbi.id} className="cell">
              <RabbiListRow {...{ rabbi, position: index }} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
})`
  ${styles.RabbisPage}
`;
