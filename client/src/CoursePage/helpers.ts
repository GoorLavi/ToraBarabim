import type { CourseTeacher } from '@torabarabim/common';

import { rabbiDisplayName, rabbiPath } from '~/helpers';

import type { CoursePageApiError } from './api';
import * as consts from './consts';

// A 404 is a fact about the course, so its screen offers a way out. Every
// other failure is transient, so its screen offers a retry instead (mirrors
// LessonPage/helpers.ts, lessonErrorCopy).
export type CourseErrorCopy =
  | { kind: 'not-found'; heading: string; explanation: string }
  | { kind: 'error'; heading: string; explanation: string };

export const courseErrorCopy = (error: CoursePageApiError | null): CourseErrorCopy => {
  if (error?.status === 404) {
    return { kind: 'not-found', heading: consts.NOT_FOUND_HEADING, explanation: consts.NOT_FOUND_EXPLANATION };
  }
  return { kind: 'error', heading: consts.SERVER_ERROR_HEADING, explanation: consts.SERVER_ERROR_EXPLANATION };
};

// Shared by `TeacherSection` (always, when the teacher is a linked rabbi)
// and `ClosedPanel` (the closed page's own way forward): a linked rabbi's
// own page, or the home page when the teacher is free text with no page of
// its own to send anyone to.
export const teacherPageLink = (teacher: CourseTeacher): { label: string; to: string } =>
  teacher.kind === 'rabbi'
    ? { label: `לעמוד של ${rabbiDisplayName(teacher.rabbi)}`, to: rabbiPath(teacher.rabbi) }
    : { label: 'לעמוד הבית', to: '/' };

