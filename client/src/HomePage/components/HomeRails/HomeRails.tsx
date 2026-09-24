import classNames from 'classnames';
import type { ReactNode } from 'react';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { CourseRail } from '~/components/CourseRail/CourseRail';

import { DedicationBand } from '../DedicationBand/DedicationBand';
import { LessonRail } from '../LessonRail/LessonRail';
import { WomensAreaBand } from '../WomensAreaBand/WomensAreaBand';
import { RailSkeleton } from './components/RailSkeleton/RailSkeleton';
import * as consts from './consts';
import { dedicationBandSlot, indexAfterNthLessonRow, shouldShowBetweenRailsDedication } from './helpers';
import type { HomeRailsProps } from './models';
import * as styles from './styles';

export const HomeRails = styled(({ className, query, dedicationGroup }: HomeRailsProps) => {
  if (query.isError) {
    return (
      <div className={classNames(className, 'error')} role="alert">
        <p className="headline">{consts.ERROR_HEADLINE}</p>
        <p className="hint">{consts.ERROR_HINT}</p>
        <button
          type="button"
          className="retry"
          onClick={() => {
            trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'homeRails' });
            query.refetch();
          }}
        >
          {consts.RETRY_LABEL}
        </button>
      </div>
    );
  }

  if (query.isPending) {
    return (
      <div className={className} aria-busy="true">
        <span className="srOnly" aria-live="polite">
          {consts.LOADING_MESSAGE}
        </span>
        {consts.SKELETON_RAIL_KEYS.map((key) => (
          <RailSkeleton key={key} />
        ))}
      </div>
    );
  }

  if (!query.data) return null;

  if (query.data.rows.length === 0) {
    return (
      <div className={classNames(className, 'empty')}>
        <p className="headline">{consts.EMPTY_HEADLINE}</p>
      </div>
    );
  }

  const { rows, womensAreaLessonCount } = query.data;

  const rails: ReactNode[] = rows.map((row) =>
    row.kind === 'lessons' ? (
      <LessonRail
        key={row.id}
        {...{ title: row.title, items: row.items, womensAreaTileIndex: row.womensAreaTileIndex, womensAreaLessonCount }}
      />
    ) : (
      <CourseRail key={row.id} {...{ title: row.title, items: row.items, surface: 'homeRail' as const }} />
    ),
  );

  const lessonRowCount = rows.filter((row) => row.kind === 'lessons').length;
  const showWomensAreaBand = womensAreaLessonCount > 0;
  const showBetweenRailsDedication = shouldShowBetweenRailsDedication(
    lessonRowCount,
    dedicationGroup !== undefined && dedicationGroup.items.length > 0,
  );

  // Computed once against the original `rows` (never against `rails` after
  // a splice moves everything after it), and reused for both bands so the
  // dedication band's own placement stays relative to it (helpers.ts).
  const womensAreaBandIndex = indexAfterNthLessonRow(rows, consts.WOMENS_AREA_BAND_SLOT);

  if (showWomensAreaBand) {
    rails.splice(womensAreaBandIndex, 0, <WomensAreaBand key="womens-area-band" {...{ lessonCount: womensAreaLessonCount }} />);
  }

  if (showBetweenRailsDedication) {
    rails.splice(
      dedicationBandSlot(womensAreaBandIndex, showWomensAreaBand),
      0,
      <DedicationBand key="dedication-band" {...{ group: dedicationGroup, variant: 'onPage' as const }} />,
    );
  }

  return <div className={className}>{rails}</div>;
})`
  ${styles.HomeRails}
`;
