import { adminErrorMessage } from '~/AdminPanel/helpers';
import { DuplicateCourseSheet as SharedDuplicateCourseSheet } from '~/components/DuplicateCourseSheet/DuplicateCourseSheet';
import type { DuplicateCourseTriggerProps } from '~/components/DuplicateCourseSheet/models';

import { useDuplicateCourse } from './useDuplicateCourse';

export const DuplicateCourseSheet = ({ courseId, courseName, sourceCycle, onDismiss, onDuplicated }: DuplicateCourseTriggerProps) => {
  const duplicateCourse = useDuplicateCourse(courseId);

  return (
    <SharedDuplicateCourseSheet
      {...{
        courseName,
        sourceCycle,
        isPending: duplicateCourse.isPending,
        errorMessage: duplicateCourse.isError ? adminErrorMessage(duplicateCourse.error) : undefined,
        // Wrapped rather than passed as `onSuccess` directly: `mutate`'s own
        // `onSuccess` also receives the mutation's variables and context,
        // and `onDuplicated` takes only the new course.
        onConfirm: (body) => duplicateCourse.mutate(body, { onSuccess: (course) => onDuplicated(course) }),
        onDismiss,
      }}
    />
  );
};
