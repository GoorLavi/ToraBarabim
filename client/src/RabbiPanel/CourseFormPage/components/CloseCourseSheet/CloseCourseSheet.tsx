import { CourseConfirmSheet } from '~/components/CourseConfirmSheet/CourseConfirmSheet';
import { rabbiErrorMessage } from '~/RabbiPanel/helpers';

import * as consts from './consts';
import type { CloseCourseSheetProps } from './models';
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
        errorMessage: closeCourse.isError ? rabbiErrorMessage(closeCourse.error) : undefined,
        onConfirm: () => closeCourse.mutate(undefined, { onSuccess: onClosed }),
        onDismiss,
      }}
    />
  );
};
