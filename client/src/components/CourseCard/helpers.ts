import type { CourseState, CourseSummary, CourseTeacher } from '@torabarabim/common';

import { COURSE_STATE_TAG_CLOSED, COURSE_STATE_TAG_FULL, COURSE_STATE_TAG_OPEN } from '~/consts';
import { rabbiDisplayName } from '~/helpers';

export const isClosedState = (state: CourseState): boolean => state.status === 'closed';

export const courseStateTagLabel = (state: CourseState): string => {
  if (state.status !== 'closed') return COURSE_STATE_TAG_OPEN;
  return state.reason === 'full' ? COURSE_STATE_TAG_FULL : COURSE_STATE_TAG_CLOSED;
};

// The teacher line: a linked rabbi always carries the honorific through
// `rabbiDisplayName`, never a hand-built string (root CLAUDE.md); an
// unlinked course shows the free text exactly as the admin typed it, with
// no honorific enforced (spec section 12, item 5, an accepted gap).
export const teacherLabel = (teacher: CourseTeacher): string => (teacher.kind === 'rabbi' ? rabbiDisplayName(teacher.rabbi) : teacher.name);

export const courseCardAriaLabel = (course: CourseSummary): string => {
  const stateSuffix = isClosedState(course.state) ? `, ${courseStateTagLabel(course.state)}` : '';
  return `${course.name}, ${teacherLabel(course.teacher)}${stateSuffix}`;
};
