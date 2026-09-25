import { adminErrorMessage } from '~/AdminPanel/helpers';
import { CourseConfirmSheet } from '~/components/CourseConfirmSheet/CourseConfirmSheet';

import * as consts from './consts';
import type { DeleteCourseSheetProps } from './models';
import { useDeleteCourse } from './useDeleteCourse';

// Permanent, no restore, cascades to the course's own photos server-side:
// the same deliberate hard delete as the rabbi panel's own sheet.
export const DeleteCourseSheet = ({ courseId, courseName, onDismiss, onDeleted }: DeleteCourseSheetProps) => {
  const deleteCourse = useDeleteCourse();

  return (
    <CourseConfirmSheet
      {...{
        heading: consts.DELETE_COURSE_HEADING,
        bodyBeforeName: consts.DELETE_COURSE_BODY_BEFORE_NAME,
        courseName,
        bodyAfterName: consts.DELETE_COURSE_BODY_AFTER_NAME,
        confirmLabel: consts.DELETE_COURSE_CONFIRM_LABEL,
        confirmVariant: 'danger',
        backLabel: consts.DELETE_COURSE_BACK_LABEL,
        isPending: deleteCourse.isPending,
        errorMessage: deleteCourse.isError ? adminErrorMessage(deleteCourse.error) : undefined,
        onConfirm: () => deleteCourse.mutate(courseId, { onSuccess: onDeleted }),
        onDismiss,
      }}
    />
  );
};
