import classNames from 'classnames';
import styled from 'styled-components';

import * as parentConsts from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/consts';

import type { OccurrenceRowProps } from './models';
import * as styles from './styles';

export const OccurrenceRow = styled(({ className, row, canWrite, onCancelClick, onMoveClick, onRestoreClick, isRestoring }: OccurrenceRowProps) => {
  const isCancelled = row.status === 'cancelled';
  // A moved or place-changed row already carries an exception (computed
  // once by the join, `models.ts`'s `hasExistingException`), which governs
  // whether a write needs that exception's id (`canWrite`, passed down).
  // Restore itself only ever shows on a cancelled row: the designer's call
  // is that the same label reading as "un-cancel" on one row and "revert my
  // move" on another is one label meaning two things in one list. A
  // "return this date to normal" action for a moved row is a different,
  // not-yet-built action with its own label.
  const isModified = row.hasExistingException && !isCancelled;

  return (
    <article className={classNames(className, { cancelled: isCancelled })}>
      <div className="top">
        <div className="dateTime">
          <span className="date" dir="auto">
            {row.dateLabel}
          </span>
          <span className={classNames('time', { struck: isCancelled })} dir="ltr">
            {row.startTime}
          </span>
        </div>

        {/* Each part isolated in its own `bdi`, never one `dir="auto"` over
            both: `auto` resolves from the first strong character, so a
            venue name starting with a Latin letter or a digit would flip
            the whole line and throw the city to the wrong side of the
            comma. The comma itself sits outside either isolate. */}
        <p className="place">
          <bdi dir="auto">{row.placeName}</bdi>
          {', '}
          <bdi dir="auto">{row.cityName}</bdi>
        </p>

        {isCancelled && (
          <div className="tags">
            <span className="tag">{parentConsts.CANCELLED_TAG_LABEL}</span>
          </div>
        )}
        {/* A cancelled row gets no change tags at all: cancelled beats any
            other change on the same date. When both moved, the order is
            fixed: time first, then place, never merged into one tag, since
            the two fields change independently. */}
        {isModified && (
          <div className="tags">
            {row.movedFromTime && <span className="tag">{parentConsts.movedFromLabel(row.movedFromTime)}</span>}
            {row.placeChanged && <span className="tag">{parentConsts.PLACE_CHANGED_TAG_LABEL}</span>}
          </div>
        )}

        {isCancelled && row.cancellationReason && (
          <p className="reason" dir="auto">
            {row.cancellationReason}
          </p>
        )}
      </div>

      <div className="actions">
        {isCancelled ? (
          <button type="button" className="action" onClick={onRestoreClick} disabled={!canWrite || isRestoring}>
            {parentConsts.RESTORE_OCCURRENCE_LABEL}
          </button>
        ) : (
          <>
            <button type="button" className="action" onClick={onCancelClick} disabled={!canWrite}>
              {parentConsts.CANCEL_OCCURRENCE_LABEL}
            </button>
            <button type="button" className="action" onClick={onMoveClick} disabled={!canWrite}>
              {parentConsts.MOVE_OCCURRENCE_LABEL}
            </button>
          </>
        )}
      </div>
    </article>
  );
})`
  ${styles.OccurrenceRow}
`;
