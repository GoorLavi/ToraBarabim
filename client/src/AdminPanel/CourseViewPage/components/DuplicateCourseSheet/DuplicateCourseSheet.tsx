import { adminErrorMessage } from '~/AdminPanel/helpers';
import { DuplicateCourseSheet as SharedDuplicateCourseSheet } from '~/components/DuplicateCourseSheet/DuplicateCourseSheet';

import type { DuplicateCourseSheetProps } from './models';
import { useDuplicateCourse } from './useDuplicateCourse';

export const DuplicateCourseSheet = ({ courseId, courseName, sourceCycle, onDismiss, onDuplicated }: DuplicateCourseSheetProps) => {
  const duplicateCourse = useDuplicateCourse(courseId);

  return (
    <SharedDuplicateCourseSheet
      {...{
        courseName,
        sourceCycle,
        isPending: duplicateCourse.isPending,
        errorMessage: duplicateCourse.isError ? adminErrorMessage(duplicateCourse.error) : undefined,
        onConfirm: (body) => duplicateCourse.mutate(body, { onSuccess: onDuplicated }),
        onDismiss,
      }}
    />
  );
};
