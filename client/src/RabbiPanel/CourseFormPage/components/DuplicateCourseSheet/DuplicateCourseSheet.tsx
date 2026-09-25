import { DuplicateCourseSheet as SharedDuplicateCourseSheet } from '~/components/DuplicateCourseSheet/DuplicateCourseSheet';
import { rabbiErrorMessage } from '~/RabbiPanel/helpers';

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
        errorMessage: duplicateCourse.isError ? rabbiErrorMessage(duplicateCourse.error) : undefined,
        // Wrapped rather than passed as `onSuccess` directly: `mutate`'s own
        // `onSuccess` also receives the mutation's variables and context,
        // and `onDuplicated` takes only the new course.
        onConfirm: (body) => duplicateCourse.mutate(body, { onSuccess: (course) => onDuplicated(course) }),
        onDismiss,
      }}
    />
  );
};
