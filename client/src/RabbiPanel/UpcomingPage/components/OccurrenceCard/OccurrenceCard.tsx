import classNames from 'classnames';
import styled from 'styled-components';

import * as parentConsts from '~/RabbiPanel/UpcomingPage/consts';

import type { OccurrenceCardProps } from './models';
import * as styles from './styles';

export const OccurrenceCard = styled(({ className, occurrence, onCancelClick, onMoveClick, onRestoreClick, isRestoring }: OccurrenceCardProps) => {
  const isCancelled = occurrence.status === 'cancelled';
  const title = occurrence.title ?? occurrence.titleFallback;

  return (
    <article className={classNames(className, { cancelled: isCancelled })}>
      <div className="top">
        <span className={classNames('time', { struck: isCancelled })} dir="ltr">
          {occurrence.startTime}
        </span>

        <div className="info">
          <h3 className="title" dir="auto">
            {title}
          </h3>
          <p className="where" dir="auto">
            {occurrence.place.name}, {occurrence.place.city}
          </p>

          {isCancelled && (
            <div className="tags">
              <span className="tag cancelled">{parentConsts.CANCELLED_TAG_LABEL}</span>
            </div>
          )}
          {/* A cancelled occurrence gets no change tags at all: cancelled
              beats any other change on the same date (design doc, section
              3). When both moved, the order is fixed: time first, then
              place, never merged into one tag, since the two fields
              change independently. */}
          {!isCancelled && (occurrence.movedFromTime || occurrence.placeChanged) && (
            <div className="tags">
              {occurrence.movedFromTime && <span className="tag moved">{parentConsts.movedFromLabel(occurrence.movedFromTime)}</span>}
              {occurrence.placeChanged && <span className="tag moved">{parentConsts.PLACE_CHANGED_TAG_LABEL}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="actions">
        {isCancelled ? (
          <button type="button" className="action" onClick={onRestoreClick} disabled={isRestoring}>
            {parentConsts.RESTORE_OCCURRENCE_LABEL}
          </button>
        ) : (
          <>
            <button type="button" className="action" onClick={onCancelClick}>
              {parentConsts.CANCEL_OCCURRENCE_LABEL}
            </button>
            <button type="button" className="action" onClick={onMoveClick}>
              {parentConsts.MOVE_OCCURRENCE_LABEL}
            </button>
          </>
        )}
      </div>
    </article>
  );
})`
  ${styles.OccurrenceCard}
`;
