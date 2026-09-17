import { useId, useState } from 'react';
import styled from 'styled-components';

import { adminErrorMessage } from '~/AdminPanel/helpers';
import * as parentConsts from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/consts';
import { useCancelOccurrenceException } from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/useCancelOccurrenceException';
import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';
import { directionForValue } from '~/helpers';

import type { CancelExceptionSheetProps } from './models';
import * as styles from './styles';

export const CancelExceptionSheet = styled(({ className, lessonId, row, isWeeklyRecurrence, onDismiss }: CancelExceptionSheetProps) => {
  const cancel = useCancelOccurrenceException();
  const [reason, setReason] = useState('');
  const reasonHelperId = useId();

  const handleConfirm = (): void => {
    cancel.mutate(
      { lessonId, date: row.date, existingExceptionId: row.existingException?.id, reason: reason.trim() || undefined },
      { onSuccess: onDismiss },
    );
  };

  return (
    <ResponsiveSheet className={className} {...{ ariaLabel: parentConsts.CANCEL_SHEET_HEADING, onDismiss }}>
      <h2 className="heading">{parentConsts.CANCEL_SHEET_HEADING}</h2>
      <p className="body">{parentConsts.cancelSheetBody(row.dateLabel, row.startTime, isWeeklyRecurrence)}</p>

      <label className="field">
        <span className="label">{parentConsts.CANCEL_REASON_LABEL}</span>
        <textarea
          rows={3}
          dir={directionForValue(reason)}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          aria-describedby={reasonHelperId}
        />
        {/* Two lines: the disclosure (the reason is published) is the half
            that cannot be undone once acted on, so it gets its own line
            rather than sitting mid-sentence where a skimming eye misses
            it. If this ever has to collapse to one line for space, use
            `CANCEL_REASON_HELPER_SINGLE_LINE` instead (see consts.ts). */}
        <span id={reasonHelperId} className="helper">
          <span className="helperLine">{parentConsts.CANCEL_REASON_HELPER_LINE_1}</span>
          <span className="helperLine">{parentConsts.CANCEL_REASON_HELPER_LINE_2}</span>
        </span>
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
