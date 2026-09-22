import classNames from 'classnames';
import styled from 'styled-components';

import * as parentConsts from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/consts';

import type { OccurrenceRowProps } from './models';
import * as styles from './styles';

export const OccurrenceRow = styled(({ className, row, canWrite, onCancelClick, onMoveClick, onRestoreClick, isRestoring }: OccurrenceRowProps) => {
  const isCancelled = row.status === 'cancelled';
  // A moved or place-changed row already carries an exception, so it can be
  // restored directly; a plain scheduled row has nothing to restore
  // (design doc's three occurrence states: scheduled, moved, cancelled).
  const isModified = !isCancelled && (row.movedFromTime !== undefined || row.placeChanged);

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

        <p className="address" dir="auto">
          {row.placeName}, {row.cityName}
        </p>

        {isCancelled && (
          <div className="tags">
            <span className="tag cancelled">{parentConsts.CANCELLED_TAG_LABEL}</span>
          </div>
        )}
        {isModified && (
          <div className="tags">
            {row.movedFromTime && <span className="tag moved">{parentConsts.movedFromLabel(row.movedFromTime)}</span>}
            {row.placeChanged && <span className="tag moved">{parentConsts.PLACE_CHANGED_TAG_LABEL}</span>}
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
            {isModified && (
              <button type="button" className="action" onClick={onRestoreClick} disabled={!canWrite || isRestoring}>
                {parentConsts.RESTORE_OCCURRENCE_LABEL}
              </button>
            )}
          </>
        )}
      </div>

      {!canWrite && <p className="unavailable">{parentConsts.ROW_UNAVAILABLE_LABEL}</p>}
    </article>
  );
})`
  ${styles.OccurrenceRow}
`;
