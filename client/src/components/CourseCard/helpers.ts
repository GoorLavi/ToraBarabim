import type { CourseState, CourseSummary, CourseTeacher } from '@torabarabim/common';

import { rabbiDisplayName } from '~/helpers';

import * as consts from './consts';

export const isClosedState = (state: CourseState): boolean => state.status === 'closed';

export const courseStateTagLabel = (state: CourseState): string => {
  if (state.status !== 'closed') return consts.STATE_TAG_OPEN;
  return state.reason === 'full' ? consts.STATE_TAG_FULL : consts.STATE_TAG_CLOSED;
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
