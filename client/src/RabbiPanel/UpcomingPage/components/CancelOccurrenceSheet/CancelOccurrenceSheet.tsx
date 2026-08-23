import styled from 'styled-components';

import { rabbiErrorMessage } from '~/RabbiPanel/helpers';
import { fullDateLabel } from '~/RabbiPanel/UpcomingPage/helpers';
import * as parentConsts from '~/RabbiPanel/UpcomingPage/consts';
import { useCancelOccurrence } from '~/RabbiPanel/UpcomingPage/useCancelOccurrence';
import { ResponsiveSheet } from '~/RabbiPanel/components/ResponsiveSheet/ResponsiveSheet';

import type { CancelOccurrenceSheetProps } from './models';
import * as styles from './styles';

export const CancelOccurrenceSheet = styled(({ className, occurrence, onDismiss }: CancelOccurrenceSheetProps) => {
  const cancel = useCancelOccurrence();
  const title = occurrence.title ?? occurrence.titleFallback;
  const dayDate = fullDateLabel(occurrence.date);

  return (
    <ResponsiveSheet className={className} ariaLabel={parentConsts.CANCEL_CONFIRM_HEADING} onDismiss={onDismiss}>
      <h2 className="heading">{parentConsts.CANCEL_CONFIRM_HEADING}</h2>
      <p className="body">{parentConsts.cancelConfirmBody(title, dayDate, occurrence.startTime)}</p>

      {cancel.isError && (
        <p className="error" role="alert">
          {rabbiErrorMessage(cancel.error)}
        </p>
      )}

      <div className="actions">
        <button
          type="button"
          className="confirm"
          disabled={cancel.isPending}
          onClick={() => cancel.mutate({ lessonId: occurrence.lessonId, date: occurrence.date }, { onSuccess: onDismiss })}
        >
          {parentConsts.CANCEL_CONFIRM_CONFIRM_LABEL}
        </button>
        <button type="button" className="back" disabled={cancel.isPending} onClick={onDismiss}>
          {parentConsts.CANCEL_CONFIRM_BACK_LABEL}
        </button>
      </div>
    </ResponsiveSheet>
  );
})`
  ${styles.CancelOccurrenceSheet}
`;
