import { useState } from 'react';
import styled from 'styled-components';

import { COURSE_CYCLE_MAX } from '~/components/CourseFormFields/consts';
import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';

import * as consts from './consts';
import type { DuplicateCourseSheetProps } from './models';
import * as styles from './styles';

// Shared by the rabbi and admin panels (each panel's own folder holds a
// thin wrapper supplying its own mutation and error mapping): the date and
// cycle fields, and the missing-date validation, are identical in both.
export const DuplicateCourseSheet = styled(({ className, courseName, sourceCycle, isPending, errorMessage, onConfirm, onDismiss }: DuplicateCourseSheetProps) => {
  const [openingDate, setOpeningDate] = useState('');
  const [cycleInput, setCycleInput] = useState(() =>
    sourceCycle !== undefined ? String(Math.min(sourceCycle + 1, COURSE_CYCLE_MAX)) : '',
  );
  const [missingDateError, setMissingDateError] = useState(false);
  const [cycleRangeError, setCycleRangeError] = useState(false);

  const handleConfirm = () => {
    const cycle = cycleInput.trim() ? Number(cycleInput) : undefined;
    const hasCycleRangeError = cycle !== undefined && (!Number.isInteger(cycle) || cycle <= 0 || cycle > COURSE_CYCLE_MAX);
    setMissingDateError(!openingDate);
    setCycleRangeError(hasCycleRangeError);
    if (!openingDate || hasCycleRangeError) return;
    onConfirm({ openingDate, cycle });
  };

  return (
    <ResponsiveSheet className={className} ariaLabel={consts.DUPLICATE_COURSE_HEADING} onDismiss={onDismiss}>
      <h2 className="heading">{consts.DUPLICATE_COURSE_HEADING}</h2>
      <p className="body">
        {consts.DUPLICATE_COURSE_BODY_BEFORE_NAME}
        <strong className="name">
          <bdi>{courseName}</bdi>
        </strong>
        {consts.DUPLICATE_COURSE_BODY_AFTER_NAME}
      </p>

      <div className="fields">
        <label className="field">
          <span className="label">{consts.OPENING_DATE_LABEL}</span>
          <input
            type="date"
            className="input"
            value={openingDate}
            onChange={(event) => {
              setOpeningDate(event.target.value);
              setMissingDateError(false);
            }}
          />
          {missingDateError && <span className="error">{consts.MISSING_OPENING_DATE_ERROR}</span>}
        </label>

        <label className="field">
          <span className="label">{consts.CYCLE_LABEL}</span>
          <input type="number" inputMode="numeric" min={1} className="input" value={cycleInput} onChange={(event) => setCycleInput(event.target.value)} />
          {cycleRangeError ? <span className="error">{consts.CYCLE_RANGE_ERROR}</span> : <span className="helper">{consts.CYCLE_HELP}</span>}
        </label>
      </div>

      {errorMessage && (
        <p className="error" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="actions">
        <button type="button" className="confirm" disabled={isPending} onClick={handleConfirm}>
          {consts.DUPLICATE_COURSE_CONFIRM_LABEL}
        </button>
        <button type="button" className="back" disabled={isPending} onClick={onDismiss}>
          {consts.DUPLICATE_COURSE_BACK_LABEL}
        </button>
      </div>
    </ResponsiveSheet>
  );
})`
  ${styles.DuplicateCourseSheet}
`;
