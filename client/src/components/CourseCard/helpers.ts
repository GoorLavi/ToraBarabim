import type { CourseState, CourseSummary, CourseTeacher } from '@torabarabim/common';

import { audienceTreatment } from '~/HomePage/components/LessonCard/helpers';
import type { AudienceTreatment, LessonCardSurface } from '~/HomePage/components/LessonCard/models';
import { COURSE_STATE_TAG_CLOSED, COURSE_STATE_TAG_FULL, COURSE_STATE_TAG_OPEN } from '~/consts';
import { rabbiDisplayName, stateSealParts } from '~/helpers';

export const isClosedState = (state: CourseState): boolean => state.status === 'closed';

export const courseStateTagLabel = (state: CourseState): string => {
  if (state.status !== 'closed') return COURSE_STATE_TAG_OPEN;
  return state.reason === 'full' ? COURSE_STATE_TAG_FULL : COURSE_STATE_TAG_CLOSED;
};

// The corner seal's own two lines: the qualifying word small, the state
// word big (design gate finding, "the two-line seal"), read from the same
// single-source label above rather than a second, retyped copy of the
// three phrases.
export const courseStateSealParts = (state: CourseState): { small: string; big: string } => stateSealParts(courseStateTagLabel(state));

// Reuses `LessonCard`'s own audience treatment (helpers.ts there): 'marked'
// for a mixed audience, 'chip' for a plain women's audience in a general
// listing, 'plain' otherwise, so a course card beside a lesson card in the
// same rail marks its audience exactly the same way. `surface` comes from
// the caller (CourseCardProps), never hard-coded here: a women's course on
// the women's area rail must read as plain text, not a chip, the same as
// every other course listed there.
export const courseAudienceTreatment = (course: Pick<CourseSummary, 'audience'>, surface: LessonCardSurface): AudienceTreatment =>
  audienceTreatment(course.audience, surface);

// The teacher line: a linked rabbi always carries the honorific through
// `rabbiDisplayName`, never a hand-built string (root CLAUDE.md); an
// unlinked course shows the free text exactly as the admin typed it, with
// no honorific enforced (spec section 12, item 5, an accepted gap).
export const teacherLabel = (teacher: CourseTeacher): string => (teacher.kind === 'rabbi' ? rabbiDisplayName(teacher.rabbi) : teacher.name);

export const courseCardAriaLabel = (course: CourseSummary): string => {
  const stateSuffix = isClosedState(course.state) ? `, ${courseStateTagLabel(course.state)}` : '';
  return `${course.name}, ${teacherLabel(course.teacher)}${stateSuffix}`;
};
