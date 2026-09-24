import { useState } from 'react';
import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';
import { rabbiErrorMessage } from '~/RabbiPanel/helpers';

import * as consts from './consts';
import type { DuplicateCourseSheetProps } from './models';
import * as styles from './styles';
import { useDuplicateCourse } from './useDuplicateCourse';

export const DuplicateCourseSheet = styled(({ className, courseId, courseName, onDismiss, onDuplicated }: DuplicateCourseSheetProps) => {
  const [openingDate, setOpeningDate] = useState('');
  const [cycleInput, setCycleInput] = useState('');
  const [missingDateError, setMissingDateError] = useState(false);
  const duplicateCourse = useDuplicateCourse(courseId);

  const handleConfirm = () => {
    if (!openingDate) {
      setMissingDateError(true);
      return;
    }
    setMissingDateError(false);
    const cycle = cycleInput.trim() ? Number(cycleInput) : undefined;
    duplicateCourse.mutate({ openingDate, cycle }, { onSuccess: onDuplicated });
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
        </label>
      </div>

      {duplicateCourse.isError && (
        <p className="error" role="alert">
          {rabbiErrorMessage(duplicateCourse.error)}
        </p>
      )}

      <div className="actions">
        <button type="button" className="confirm" disabled={duplicateCourse.isPending} onClick={handleConfirm}>
          {consts.DUPLICATE_COURSE_CONFIRM_LABEL}
        </button>
        <button type="button" className="back" disabled={duplicateCourse.isPending} onClick={onDismiss}>
          {consts.DUPLICATE_COURSE_BACK_LABEL}
        </button>
      </div>
    </ResponsiveSheet>
  );
})`
  ${styles.DuplicateCourseSheet}
`;
