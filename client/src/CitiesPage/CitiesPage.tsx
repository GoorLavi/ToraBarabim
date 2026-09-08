import styled from 'styled-components';

import { Footer } from '~/HomePage/components/Footer/Footer';
import { LessonPageHeader } from '~/components/LessonPageHeader/LessonPageHeader';
import { StateCard } from '~/components/StateCard/StateCard';

import { CityAreaSection } from './components/CityAreaSection/CityAreaSection';
import { CityAreaSectionSkeleton } from './components/CityAreaSectionSkeleton/CityAreaSectionSkeleton';
import * as consts from './consts';
import { cityCountLabel, totalCityCount } from './helpers';
import type { CitiesPageProps } from './models';
import * as styles from './styles';
import { useCityDirectory } from './useCityDirectory';

export const CitiesPage = styled(({ className }: CitiesPageProps) => {
  const query = useCityDirectory();

  const areas = query.data?.areas ?? [];
  const isBoardEmpty = query.isSuccess && areas.length === 0;

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
                <p className="sub">{`${cityCountLabel(totalCityCount(areas))} · ${consts.ORDER_LABEL}`}</p>
              )}
            </>
          )}
        </div>

        {query.isPending &&
          consts.AREA_SKELETON_KEYS.map((key) => <CityAreaSectionSkeleton key={key} />)}

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

        {query.isSuccess &&
          !isBoardEmpty &&
          areas.map((areaGroup) => <CityAreaSection key={areaGroup.area} areaGroup={areaGroup} />)}
      </div>

      <div className="footer">
        <Footer />
      </div>
    </div>
  );
})`
  ${styles.CitiesPage}
`;
