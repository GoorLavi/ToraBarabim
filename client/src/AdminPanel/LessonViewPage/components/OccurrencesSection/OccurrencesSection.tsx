import { useState } from 'react';
import styled from 'styled-components';

import { adminErrorMessage } from '~/AdminPanel/helpers';

import { CancelExceptionSheet } from './components/CancelExceptionSheet/CancelExceptionSheet';
import { MoveExceptionSheet } from './components/MoveExceptionSheet/MoveExceptionSheet';
import { OccurrenceRow } from './components/OccurrenceRow/OccurrenceRow';
import * as consts from './consts';
import { canWriteRow } from './helpers';
import type { ActiveSheet, OccurrenceRowData, OccurrencesSectionProps } from './models';
import * as styles from './styles';
import { useLessonOccurrences } from './useLessonOccurrences';
import { useRestoreOccurrenceException } from './useRestoreOccurrenceException';

export const OccurrencesSection = styled(({ className, lesson }: OccurrencesSectionProps) => {
  const lessonId = lesson.id;
  const isWeeklyRecurrence = lesson.recurrence.kind === 'weekly';
  const state = useLessonOccurrences(lessonId, lesson);
  const restore = useRestoreOccurrenceException();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(undefined);

  const closeSheet = (): void => setActiveSheet(undefined);
  const openCancelSheet = (row: OccurrenceRowData): void => setActiveSheet({ kind: 'cancel', row });
  const openMoveSheet = (row: OccurrenceRowData): void => setActiveSheet({ kind: 'move', row });
  const restoreRow = (exceptionId: number | undefined): void => {
    if (exceptionId === undefined) return;
    restore.mutate({ lessonId, exceptionId });
  };

  return (
    <section className={className}>
      <h2 className="heading">{consts.SECTION_HEADING}</h2>
      <p className="note">{consts.sectionNote(isWeeklyRecurrence)}</p>

      {restore.isError && (
        <p className="mutationError" role="alert">
          {adminErrorMessage(restore.error)}
        </p>
      )}

      {state.status === 'pending' && (
        <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_LABEL}>
          <div className="skeletonRow" />
          <div className="skeletonRow" />
        </div>
      )}

      {state.status === 'error' && (
        <div className="state error" role="alert">
          <p className="headline">{consts.ERROR_HEADLINE}</p>
          <p className="hint">{consts.ERROR_HINT}</p>
          <button type="button" className="retry" onClick={state.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      )}

      {state.status === 'empty' && (
        <div className="state">
          <p className="headline">{consts.EMPTY_HEADLINE}</p>
          <p className="hint">{consts.EMPTY_HINT}</p>
        </div>
      )}

      {(state.status === 'success' || state.status === 'exceptionsUnavailable') && (
        <div className="rows">
          {state.status === 'exceptionsUnavailable' && (
            <div className="exceptionsWarning" role="alert">
              <p className="message">{consts.EXCEPTIONS_UNAVAILABLE_MESSAGE}</p>
              <button type="button" className="retry" onClick={state.retry}>
                {consts.RETRY_LABEL}
              </button>
            </div>
          )}

          {state.rows.map((row) => {
            const isRestoringThis = restore.isPending && restore.variables?.exceptionId === row.existingException?.id;
            return (
              <OccurrenceRow
                key={row.date}
                className="row"
                {...{
                  row,
                  canWrite: canWriteRow(row),
                  onCancelClick: () => openCancelSheet(row),
                  onMoveClick: () => openMoveSheet(row),
                  onRestoreClick: () => restoreRow(row.existingException?.id),
                  isRestoring: isRestoringThis,
                }}
              />
            );
          })}
        </div>
      )}

      {activeSheet?.kind === 'cancel' && (
        <CancelExceptionSheet {...{ lessonId, row: activeSheet.row, isWeeklyRecurrence, onDismiss: closeSheet }} />
      )}
      {activeSheet?.kind === 'move' && <MoveExceptionSheet {...{ lessonId, row: activeSheet.row, onDismiss: closeSheet }} />}
    </section>
  );
})`
  ${styles.OccurrencesSection}
`;
