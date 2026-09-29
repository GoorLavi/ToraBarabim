import { adminErrorMessage } from '~/AdminPanel/helpers';
import * as consts from '~/components/CloseCourseSheet/consts';
import type { CloseCourseSheetProps } from '~/components/CloseCourseSheet/models';
import { CourseConfirmSheet } from '~/components/CourseConfirmSheet/CourseConfirmSheet';

import { useCloseCourse } from './useCloseCourse';

export const CloseCourseSheet = ({ courseId, courseName, onDismiss, onClosed }: CloseCourseSheetProps) => {
  const closeCourse = useCloseCourse(courseId);

  return (
    <CourseConfirmSheet
      {...{
        heading: consts.CLOSE_COURSE_HEADING,
        bodyBeforeName: consts.CLOSE_COURSE_BODY_BEFORE_NAME,
        courseName,
        bodyAfterName: consts.CLOSE_COURSE_BODY_AFTER_NAME,
        confirmLabel: consts.CLOSE_COURSE_CONFIRM_LABEL,
        confirmVariant: 'primary',
        backLabel: consts.CLOSE_COURSE_BACK_LABEL,
        isPending: closeCourse.isPending,
        errorMessage: closeCourse.isError ? adminErrorMessage(closeCourse.error) : undefined,
        onConfirm: () => closeCourse.mutate(undefined, { onSuccess: onClosed }),
        onDismiss,
      }}
    />
  );
};
