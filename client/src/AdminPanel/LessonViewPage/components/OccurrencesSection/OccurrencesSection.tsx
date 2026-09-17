import { useState } from 'react';
import styled from 'styled-components';

import { adminErrorMessage } from '~/AdminPanel/helpers';

import { CancelExceptionSheet } from './components/CancelExceptionSheet/CancelExceptionSheet';
import { MoveExceptionSheet } from './components/MoveExceptionSheet/MoveExceptionSheet';
import { OccurrenceRow } from './components/OccurrenceRow/OccurrenceRow';
import * as consts from './consts';
import { canWriteRow } from './helpers';
import type { ActiveSheet, OccurrencesSectionProps } from './models';
import * as styles from './styles';
import { useLessonOccurrences } from './useLessonOccurrences';
import { useRestoreOccurrenceException } from './useRestoreOccurrenceException';

export const OccurrencesSection = styled(({ className, lessonId, lesson }: OccurrencesSectionProps) => {
  const state = useLessonOccurrences(lessonId, lesson);
  const restore = useRestoreOccurrenceException();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(undefined);

  return (
    <section className={className}>
      <h2 className="heading">{consts.SECTION_HEADING}</h2>
      <p className="note">{consts.SECTION_NOTE}</p>

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
            const isRestoringThis = restore.isPending && restore.variables?.exceptionId === row.exceptionId;
            return (
              <OccurrenceRow
                key={row.date}
                className="row"
                row={row}
                canWrite={canWriteRow(row)}
                onCancelClick={() => setActiveSheet({ kind: 'cancel', row })}
                onMoveClick={() => setActiveSheet({ kind: 'move', row })}
                onRestoreClick={() => {
                  if (row.exceptionId === undefined) return;
                  restore.mutate({ lessonId, exceptionId: row.exceptionId });
                }}
                isRestoring={isRestoringThis}
              />
            );
          })}
        </div>
      )}

      {activeSheet?.kind === 'cancel' && (
        <CancelExceptionSheet lessonId={lessonId} row={activeSheet.row} onDismiss={() => setActiveSheet(undefined)} />
      )}
      {activeSheet?.kind === 'move' && <MoveExceptionSheet lessonId={lessonId} row={activeSheet.row} onDismiss={() => setActiveSheet(undefined)} />}
    </section>
  );
})`
  ${styles.OccurrencesSection}
`;
