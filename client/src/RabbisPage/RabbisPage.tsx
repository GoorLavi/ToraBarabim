import { useState } from 'react';
import styled from 'styled-components';

import { Footer } from '~/HomePage/components/Footer/Footer';
import { LessonPageHeader } from '~/components/LessonPageHeader/LessonPageHeader';
import { StateCard } from '~/components/StateCard/StateCard';

import { RabbiListRow } from './components/RabbiListRow/RabbiListRow';
import { RabbiListRowSkeleton } from './components/RabbiListRowSkeleton/RabbiListRowSkeleton';
import { RabbiSearchField } from './components/RabbiSearchField/RabbiSearchField';
import * as consts from './consts';
import { filterRabbisByName, rabbiCountLabel } from './helpers';
import type { RabbisPageProps } from './models';
import * as styles from './styles';
import { useRabbiDirectory } from './useRabbiDirectory';

export const RabbisPage = styled(({ className }: RabbisPageProps) => {
  const query = useRabbiDirectory();
  const [search, setSearch] = useState('');

  const rabbis = query.data ?? [];
  const isBoardEmpty = query.isSuccess && rabbis.length === 0;
  const trimmedSearch = search.trim();
  const filteredRabbis = filterRabbisByName(rabbis, trimmedSearch);
  const hasNoResults = query.isSuccess && !isBoardEmpty && trimmedSearch !== '' && filteredRabbis.length === 0;

  return (
    <div className={className}>
      <LessonPageHeader />

      <div className="content">
        <div className="titleBlock">
          {query.isPending ? (
            <>
              <span className="headingBar" />
              <span className="subBar" />
            </>
          ) : (
            <>
              <h1 className="heading">{consts.PAGE_TITLE}</h1>
              {!query.isError && !isBoardEmpty && (
                <p className="sub">
                  {hasNoResults ? consts.NO_RESULTS_SUBLINE : `${rabbiCountLabel(rabbis.length)} · ${consts.ORDER_LABEL}`}
                </p>
              )}
            </>
          )}
        </div>

        {!query.isPending && !query.isError && !isBoardEmpty && (
          <RabbiSearchField className="search" value={search} onChange={setSearch} />
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
            heading={consts.LOAD_ERROR_HEADING}
            body={consts.LOAD_ERROR_BODY}
            action={{ actionLabel: consts.RETRY_LABEL, actionStyle: 'primary', onAction: () => query.refetch() }}
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
              </>
            }
            body={consts.NO_RESULTS_BODY}
            action={{ actionLabel: consts.CLEAR_SEARCH_LABEL, actionStyle: 'quiet', onAction: () => setSearch('') }}
          />
        )}

        {query.isSuccess && !isBoardEmpty && !hasNoResults && (
          <ul className="list">
            {filteredRabbis.map((rabbi) => (
              <li key={rabbi.id}>
                <RabbiListRow rabbi={rabbi} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="footer">
        <Footer />
      </div>
    </div>
  );
})`
  ${styles.RabbisPage}
`;
