import classNames from 'classnames';
import styled from 'styled-components';

import { dayLabel } from '~/HomePage/helpers';

import { DayLessons } from './components/DayLessons/DayLessons';
import * as consts from './consts';
import { dayHeadingLabel, getErrorMessage, selectDaySections } from './helpers';
import type { LessonsSectionProps } from './models';
import * as styles from './styles';

export const LessonsSection = styled(({ className, query, targetDate, city, searchQuery }: LessonsSectionProps) => {
  if (query.isPending) {
    return (
      <div className={classNames(className, 'state', 'loading')} aria-live="polite">
        <p className="message">{consts.LOADING_MESSAGE}</p>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className={classNames(className, 'state', 'error')} role="alert">
        <p className="message">{getErrorMessage(query.error)}</p>
        <button type="button" className="retry" onClick={() => query.refetch()}>
          {consts.RETRY_LABEL}
        </button>
      </div>
    );
  }

  if (!query.data) return null;

  const { primary, fallback } = selectDaySections(query.data.items, targetDate);
  const primaryLabel = dayLabel(targetDate);
  const cityName = city?.name;

  if (primary.items.length > 0) {
    return (
      <div className={className}>
        <DayLessons
          headingLabel={dayHeadingLabel(primaryLabel, cityName)}
          items={primary.items}
          showSeeAllLink
          moreLabel={consts.moreLessonsLabel(primaryLabel)}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="empty">
        <p className="headline">{consts.noLessonsHeadline(primaryLabel, cityName, searchQuery)}</p>
        {fallback && (
          <p className="hint">
            {consts.nextDayCountLabel(fallback.items.length, dayLabel(fallback.date), cityName, searchQuery)}
          </p>
        )}
        {!fallback && <p className="hint">{consts.noLessonsHint(searchQuery)}</p>}
      </div>

      {fallback && (
        <DayLessons
          headingLabel={dayHeadingLabel(dayLabel(fallback.date), cityName)}
          items={fallback.items}
          showSeeAllLink={false}
          moreLabel={consts.moreLessonsLabel(dayLabel(fallback.date))}
        />
      )}
    </div>
  );
})`
  ${styles.LessonsSection}
`;
