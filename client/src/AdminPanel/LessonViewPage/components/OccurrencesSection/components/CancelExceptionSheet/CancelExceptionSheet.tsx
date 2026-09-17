import { useState } from 'react';
import styled from 'styled-components';

import { adminErrorMessage } from '~/AdminPanel/helpers';
import * as parentConsts from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/consts';
import { useCancelOccurrenceException } from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/useCancelOccurrenceException';
import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';
import { directionForValue } from '~/helpers';

import type { CancelExceptionSheetProps } from './models';
import * as styles from './styles';

export const CancelExceptionSheet = styled(({ className, lessonId, row, onDismiss }: CancelExceptionSheetProps) => {
  const cancel = useCancelOccurrenceException();
  const [reason, setReason] = useState('');

  const handleConfirm = (): void => {
    cancel.mutate(
      { lessonId, date: row.date, existingExceptionId: row.exceptionId, reason: reason.trim() || undefined },
      { onSuccess: onDismiss },
    );
  };

  return (
    <ResponsiveSheet className={className} ariaLabel={parentConsts.CANCEL_SHEET_HEADING} onDismiss={onDismiss}>
      <h2 className="heading">{parentConsts.CANCEL_SHEET_HEADING}</h2>
      <p className="body">{parentConsts.cancelSheetBody(row.dateLabel, row.startTime)}</p>

      <label className="field">
        <span className="label">{parentConsts.CANCEL_REASON_LABEL}</span>
        <textarea rows={3} dir={directionForValue(reason)} value={reason} onChange={(event) => setReason(event.target.value)} />
      </label>

      {cancel.isError && (
        <p className="error" role="alert">
          {adminErrorMessage(cancel.error)}
        </p>
      )}

      <div className="actions">
        <button type="button" className="confirm" disabled={cancel.isPending} onClick={handleConfirm}>
          {parentConsts.CANCEL_CONFIRM_LABEL}
        </button>
        <button type="button" className="back" disabled={cancel.isPending} onClick={onDismiss}>
          {parentConsts.CANCEL_BACK_LABEL}
        </button>
      </div>
    </ResponsiveSheet>
  );
})`
  ${styles.CancelExceptionSheet}
`;
