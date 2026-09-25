import { useState } from 'react';
import styled from 'styled-components';

import { COURSE_CYCLE_MAX, CYCLE_RANGE_ERROR } from '~/components/CourseFormFields/consts';
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
    <ResponsiveSheet {...{ className, ariaLabel: consts.DUPLICATE_COURSE_HEADING, onDismiss }}>
      <h2 className="heading">{consts.DUPLICATE_COURSE_HEADING}</h2>
      <p className="body">
        {consts.DUPLICATE_COURSE_BODY_BEFORE_NAME}
        <strong className="name">
          <bdi>{courseName}</bdi>
        </strong>
        {consts.DUPLICATE_COURSE_BODY_AFTER_NAME}
      </p>

      <div className="fields">
        <div className="field">
          <label className="label" htmlFor="duplicateCourseOpeningDate">
            {consts.OPENING_DATE_LABEL}
          </label>
          <input
            id="duplicateCourseOpeningDate"
            type="date"
            className="input"
            value={openingDate}
            onChange={(event) => {
              setOpeningDate(event.target.value);
              setMissingDateError(false);
            }}
            aria-describedby={missingDateError ? 'duplicateCourseOpeningDateHint' : undefined}
          />
          {missingDateError && (
            <span className="error" id="duplicateCourseOpeningDateHint">
              {consts.MISSING_OPENING_DATE_ERROR}
            </span>
          )}
        </div>

        <div className="field">
          <label className="label" htmlFor="duplicateCourseCycle">
            {consts.CYCLE_LABEL}
          </label>
          <input
            id="duplicateCourseCycle"
            type="number"
            inputMode="numeric"
            min={1}
            className="input"
            value={cycleInput}
            onChange={(event) => setCycleInput(event.target.value)}
            aria-describedby="duplicateCourseCycleHint"
          />
          {cycleRangeError ? (
            <span className="error" id="duplicateCourseCycleHint">
              {CYCLE_RANGE_ERROR}
            </span>
          ) : (
            <span className="helper" id="duplicateCourseCycleHint">
              {consts.CYCLE_HELP}
            </span>
          )}
        </div>
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
