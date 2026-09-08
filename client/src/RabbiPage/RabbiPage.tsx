import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { BackLink } from '~/components/BackLink/BackLink';
import { LessonPageHeader } from '~/components/LessonPageHeader/LessonPageHeader';
import { StateCard } from '~/components/StateCard/StateCard';

import { LessonsSection } from './components/LessonsSection/LessonsSection';
import { RabbiBodySkeleton } from './components/RabbiBodySkeleton/RabbiBodySkeleton';
import { RabbiEmptyLessons } from './components/RabbiEmptyLessons/RabbiEmptyLessons';
import { RabbiHero } from './components/RabbiHero/RabbiHero';
import { RabbiHeroSkeleton } from './components/RabbiHeroSkeleton/RabbiHeroSkeleton';
import * as consts from './consts';
import { rabbiErrorCopy, sortByDate } from './helpers';
import type { RabbiPageProps } from './models';
import * as styles from './styles';
import { useNationwideLessons } from './useNationwideLessons';
import { useRabbiDetail } from './useRabbiDetail';
import { useRabbiLessons } from './useRabbiLessons';

// The poster is the page (design spec, "the guidance frame states the
// intent in one line"): call 1 (rabbi detail) and call 2 (the rabbi's own
// lessons) run together, since both need only the route's rabbiId. Call 3
// (nationwide lessons) only fires once call 1 says the rabbi has none of
// their own, never speculatively (useNationwideLessons.ts).
export const RabbiPage = styled(({ className }: RabbiPageProps) => {
  const { rabbiId = '' } = useParams();
  const rabbiQuery = useRabbiDetail(rabbiId);
  const lessonsQuery = useRabbiLessons(rabbiId);
  const rabbi = rabbiQuery.data;
  const hasNoLessons = rabbi?.lessonCount === 0;
  const nationwideQuery = useNationwideLessons(Boolean(hasNoLessons));
  const errorCopy = rabbiQuery.error ? rabbiErrorCopy(rabbiQuery.error) : null;

  return (
    <div className={className}>
      <LessonPageHeader />

      <div className="content">
        <BackLink to="/rabbis" label={consts.BACK_TO_ALL_RABBIS_LABEL} />

        {rabbiQuery.isPending && (
          <>
            <RabbiHeroSkeleton />
            <RabbiBodySkeleton />
          </>
        )}

        {errorCopy?.kind === 'not-found' && (
          <StateCard
            variant="surface"
            headingLevel="h1"
            heading={errorCopy.heading}
            body={errorCopy.body}
            action={{ actionLabel: consts.ALL_RABBIS_LABEL, actionStyle: 'primary', actionTo: '/rabbis' }}
          />
        )}

        {errorCopy?.kind === 'error' && (
          <StateCard
            variant="surface"
            headingLevel="h1"
            heading={errorCopy.heading}
            body={errorCopy.body}
            action={{ actionLabel: consts.RETRY_LABEL, actionStyle: 'primary', onAction: () => rabbiQuery.refetch() }}
          />
        )}

        {rabbi && (
          <>
            <div className="top">
              <RabbiHero rabbi={rabbi} />
              {rabbi.bio && (
                <div className="bio">
                  <p className="text" dir="auto">
                    {rabbi.bio}
                  </p>
                </div>
              )}
            </div>

            {hasNoLessons ? (
              <RabbiEmptyLessons
                rabbiName={rabbi.name}
                nationwideItems={nationwideQuery.data?.items}
                isNationwidePending={nationwideQuery.isPending}
                isNationwideError={nationwideQuery.isError}
              />
            ) : (
              <LessonsSection
                showSubheading={rabbi.lessonCount >= 2}
                items={lessonsQuery.data ? sortByDate(lessonsQuery.data.items) : undefined}
                isPending={lessonsQuery.isPending}
                isError={lessonsQuery.isError}
                onRetry={() => lessonsQuery.refetch()}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
})`
  ${styles.RabbiPage}
`;
