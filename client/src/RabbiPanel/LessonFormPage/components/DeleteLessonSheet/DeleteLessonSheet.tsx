import styled from 'styled-components';

import { ResponsiveSheet } from '~/RabbiPanel/components/ResponsiveSheet/ResponsiveSheet';
import { rabbiErrorMessage } from '~/RabbiPanel/helpers';

import * as consts from './consts';
import type { DeleteLessonSheetProps } from './models';
import * as styles from './styles';
import { useDeleteLesson } from './useDeleteLesson';

// The deletion is permanent, with no log and no restore: an approved
// product decision (see the report for this slice), not an oversight.
export const DeleteLessonSheet = styled(({ className, lessonId, lessonTitle, onDismiss, onDeleted }: DeleteLessonSheetProps) => {
  const deleteLesson = useDeleteLesson();

  return (
    <ResponsiveSheet className={className} ariaLabel={consts.DELETE_CONFIRM_HEADING} onDismiss={onDismiss}>
      <h2 className="heading">{consts.DELETE_CONFIRM_HEADING}</h2>
      <p className="body">{consts.deleteConfirmBody(lessonTitle)}</p>
      <p className="alternative">{consts.DELETE_CONFIRM_ALTERNATIVE}</p>

      {deleteLesson.isError && (
        <p className="error" role="alert">
          {rabbiErrorMessage(deleteLesson.error)}
        </p>
      )}

      <div className="actions">
        <button type="button" className="confirm" disabled={deleteLesson.isPending} onClick={() => deleteLesson.mutate(lessonId, { onSuccess: onDeleted })}>
          {consts.DELETE_CONFIRM_CONFIRM_LABEL}
        </button>
        <button type="button" className="back" disabled={deleteLesson.isPending} onClick={onDismiss}>
          {consts.DELETE_CONFIRM_BACK_LABEL}
        </button>
      </div>
    </ResponsiveSheet>
  );
})`
  ${styles.DeleteLessonSheet}
`;
