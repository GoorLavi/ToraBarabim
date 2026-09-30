import classNames from 'classnames';
import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';

import type { CourseConfirmSheetProps } from './models';
import * as styles from './styles';

// The shared shape behind close, full and delete (design brief B, item 8
// onward): a heading, one body sentence group with the course name always
// in bold inside `<bdi>`, and a confirm/back pair. Duplicate is its own
// sheet, since it carries form fields the other three do not.
export const CourseConfirmSheet = styled(
  ({
    className,
    heading,
    bodyBeforeName,
    courseName,
    bodyAfterName,
    confirmLabel,
    confirmVariant,
    backLabel,
    isPending,
    errorMessage,
    onConfirm,
    onDismiss,
  }: CourseConfirmSheetProps) => (
    <ResponsiveSheet {...{ className, ariaLabel: heading, onDismiss }}>
      <h2 className="heading">{heading}</h2>
      <p className="body">
        {bodyBeforeName}
        <strong className="name">
          <bdi>{courseName}</bdi>
        </strong>
        {bodyAfterName}
      </p>

      {errorMessage && (
        <p className="error" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="actions">
        <button type="button" className={classNames('confirm', confirmVariant)} disabled={isPending} onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" className="back" disabled={isPending} onClick={onDismiss}>
          {backLabel}
        </button>
      </div>
    </ResponsiveSheet>
  ),
)`
  ${styles.CourseConfirmSheet}
`;
