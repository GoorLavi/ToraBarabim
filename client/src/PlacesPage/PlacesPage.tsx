import { useState } from 'react';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { StateCard } from '~/components/StateCard/StateCard';

import { PlaceListRow } from './components/PlaceListRow/PlaceListRow';
import { PlaceListRowSkeleton } from './components/PlaceListRowSkeleton/PlaceListRowSkeleton';
import { PlaceSearchField } from './components/PlaceSearchField/PlaceSearchField';
import * as consts from './consts';
import { filterPlacesByName } from './helpers';
import type { PlacesPageProps } from './models';
import * as styles from './styles';
import { usePlaceDirectory } from './usePlaceDirectory';

// Follows RabbisPage: one column at 375, two from `md`; the search field
// filters the already-loaded directory client-side rather than a second
// request. No trackEvent(resultsShown): RabbisPage does not fire it either,
// by the same design this directory follows (analytics/consts.ts,
// "RabbisPage... do not, by design").
export const PlacesPage = styled(({ className }: PlacesPageProps) => {
  const query = usePlaceDirectory();
  const [search, setSearch] = useState('');

  const places = query.data ?? [];
  const isBoardEmpty = query.isSuccess && places.length === 0;
  const trimmedSearch = search.trim();
  const filteredPlaces = filterPlacesByName(places, trimmedSearch);
  const hasNoResults = query.isSuccess && !isBoardEmpty && trimmedSearch !== '' && filteredPlaces.length === 0;
  const isSearchActive = trimmedSearch !== '' && !hasNoResults;
  const subline = hasNoResults
    ? consts.NO_RESULTS_SUBLINE
    : isSearchActive
      ? consts.placeMatchCountLabel(filteredPlaces.length)
      : consts.placeCountLabel(places.length);

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
            <h1 className="heading">{consts.PAGE_TITLE}</h1>
            {!query.isError && !isBoardEmpty && <p className="sub">{subline}</p>}
          </>
        )}
      </div>

      {!query.isPending && !query.isError && !isBoardEmpty && (
        <div className="searchField">
          <label className="searchLabel" htmlFor={consts.SEARCH_FIELD_ID}>
            {consts.SEARCH_FIELD_LABEL}
          </label>
          <PlaceSearchField
            {...{ id: consts.SEARCH_FIELD_ID, value: search, onChange: setSearch, ariaLabel: consts.SEARCH_INPUT_ARIA_LABEL }}
            className="search"
          />
        </div>
      )}

      {query.isPending && (
        <ul className="skeletonList">
          {consts.ROW_SKELETON_KEYS.map((key) => (
            <li key={key}>
              <PlaceListRowSkeleton />
            </li>
          ))}
        </ul>
      )}

      {query.isError && (
        <StateCard
          variant="surface"
          headingLevel="h2"
          heading={consts.LOAD_ERROR_HEADING}
          body={consts.LOAD_ERROR_BODY}
          action={{
            actionLabel: consts.RETRY_LABEL,
            actionStyle: 'primary',
            onAction: () => {
              trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'placesPage' });
              query.refetch();
            },
          }}
        />
      )}

      {query.isSuccess && isBoardEmpty && (
        <StateCard
          variant="empty"
          headingLevel="h2"
          heading={consts.BOARD_EMPTY_HEADING}
          body={consts.BOARD_EMPTY_BODY}
          action={{ actionLabel: consts.CONTACT_US_LABEL, actionStyle: 'primary', actionTo: '/contact' }}
        />
      )}

      {query.isSuccess && !isBoardEmpty && hasNoResults && (
        <StateCard
          variant="surface"
          headingLevel="h2"
          heading={
            <>
              {consts.NO_RESULTS_HEADING_PREFIX}
              <span dir="auto">{trimmedSearch}</span>
              {consts.NO_RESULTS_HEADING_SUFFIX}
            </>
          }
          body={consts.NO_RESULTS_BODY}
          action={{ actionLabel: consts.CLEAR_SEARCH_LABEL, actionStyle: 'quiet', onAction: () => setSearch('') }}
        />
      )}

      {query.isSuccess && !isBoardEmpty && !hasNoResults && (
        <ul className="list">
          {filteredPlaces.map((place) => (
            <li key={place.id} className="cell">
              <PlaceListRow {...{ place }} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
})`
  ${styles.PlacesPage}
`;
