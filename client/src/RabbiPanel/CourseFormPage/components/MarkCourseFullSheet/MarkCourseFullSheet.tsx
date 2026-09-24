import { CourseConfirmSheet } from '~/components/CourseConfirmSheet/CourseConfirmSheet';
import { rabbiErrorMessage } from '~/RabbiPanel/helpers';

import * as consts from './consts';
import type { MarkCourseFullSheetProps } from './models';
import { useMarkCourseFull } from './useMarkCourseFull';

export const MarkCourseFullSheet = ({ courseId, courseName, onDismiss, onMarkedFull }: MarkCourseFullSheetProps) => {
  const markCourseFull = useMarkCourseFull(courseId);

  return (
    <CourseConfirmSheet
      {...{
        heading: consts.MARK_FULL_HEADING,
        bodyBeforeName: consts.MARK_FULL_BODY_BEFORE_NAME,
        courseName,
        bodyAfterName: consts.MARK_FULL_BODY_AFTER_NAME,
        confirmLabel: consts.MARK_FULL_CONFIRM_LABEL,
        confirmVariant: 'primary',
        backLabel: consts.MARK_FULL_BACK_LABEL,
        isPending: markCourseFull.isPending,
        errorMessage: markCourseFull.isError ? rabbiErrorMessage(markCourseFull.error) : undefined,
        onConfirm: () => markCourseFull.mutate(undefined, { onSuccess: onMarkedFull }),
        onDismiss,
      }}
    />
  );
};
