import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { RABBI_ROUTES } from '~/RabbiPanel/consts';
import { rabbiErrorMessage } from '~/RabbiPanel/helpers';

import { CancelOccurrenceSheet } from './components/CancelOccurrenceSheet/CancelOccurrenceSheet';
import { MoveOccurrenceSheet } from './components/MoveOccurrenceSheet/MoveOccurrenceSheet';
import { OccurrenceCard } from './components/OccurrenceCard/OccurrenceCard';
import * as consts from './consts';
import { dayHeading, todayInIsrael } from './helpers';
import type { ActiveSheet, UpcomingPageProps } from './models';
import * as styles from './styles';
import { useRestoreOccurrence } from './useRestoreOccurrence';
import { useUpcomingOccurrences } from './useUpcomingOccurrences';

export const UpcomingPage = styled(({ className }: UpcomingPageProps) => {
  const state = useUpcomingOccurrences();
  const restore = useRestoreOccurrence();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(undefined);
  const today = todayInIsrael();

  return (
    <div className={className}>
      <h1 className="heading">{consts.HEADING}</h1>
      <p className="subtext">{consts.SUBTEXT}</p>

      {restore.isError && (
        <p className="mutationError" role="alert">
          {rabbiErrorMessage(restore.error)}
        </p>
      )}

      {state.status === 'pending' && (
        <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          <div className="skeletonLabel" />
          <div className="skeletonCard" />
          <div className="skeletonCard" />
        </div>
      )}

      {state.status === 'error' && (
        <div className="state" role="alert">
          <p className="headline">{consts.ERROR_HEADLINE}</p>
          <p className="hint">{consts.ERROR_HINT}</p>
          <button type="button" className="cta ghost" onClick={state.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      )}

      {state.status === 'emptyFirst' && (
        <div className="state">
          <div className="emptyIcon" aria-hidden="true" />
          <p className="headline">{consts.EMPTY_FIRST_HEADLINE}</p>
          <p className="hint">{consts.EMPTY_FIRST_HINT}</p>
          <Link className="cta" to={RABBI_ROUTES.lessonNew}>
            {consts.EMPTY_FIRST_CTA}
          </Link>
        </div>
      )}

      {state.status === 'emptyWindow' && (
        <div className="state">
          <p className="headline">{consts.EMPTY_WINDOW_HEADLINE}</p>
          <p className="hint">{consts.EMPTY_WINDOW_HINT}</p>
          <Link className="cta" to={RABBI_ROUTES.lessons}>
            {consts.EMPTY_WINDOW_CTA}
          </Link>
        </div>
      )}

      {state.status === 'success' &&
        state.groups.map((group) => {
          const heading = dayHeading(group.date, today);
          return (
            <div key={group.date} className="dayGroup">
              <div className="dayHeading">
                <span className="dayLabel">{heading.boldLabel}</span>
                <span>{heading.dateLabel}</span>
              </div>

              {group.occurrences.map((occurrence) => {
                const isRestoringThis =
                  restore.isPending && restore.variables?.lessonId === occurrence.lessonId && restore.variables.date === occurrence.date;
                return (
                  <OccurrenceCard
                    key={`${occurrence.lessonId}-${occurrence.date}`}
                    className="occurrenceCard"
                    occurrence={occurrence}
                    onCancelClick={() => setActiveSheet({ kind: 'cancel', occurrence })}
                    onMoveClick={() => setActiveSheet({ kind: 'move', occurrence })}
                    onRestoreClick={() => restore.mutate({ lessonId: occurrence.lessonId, date: occurrence.date })}
                    isRestoring={isRestoringThis}
                  />
                );
              })}
            </div>
          );
        })}

      {activeSheet?.kind === 'cancel' && (
        <CancelOccurrenceSheet occurrence={activeSheet.occurrence} onDismiss={() => setActiveSheet(undefined)} />
      )}
      {activeSheet?.kind === 'move' && <MoveOccurrenceSheet occurrence={activeSheet.occurrence} onDismiss={() => setActiveSheet(undefined)} />}
    </div>
  );
})`
  ${styles.UpcomingPage}
`;
