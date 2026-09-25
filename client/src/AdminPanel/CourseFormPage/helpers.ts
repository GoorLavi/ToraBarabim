import type { CourseResponse, CourseTeacherInput, CreateCourseRequest } from '@torabarabim/common';

import { buildCoursePayload } from '~/components/CourseFormFields/helpers';
import type { CourseFormState } from '~/components/CourseFormFields/models';

import * as teacherPickerConsts from './components/TeacherPicker/consts';
import type { TeacherFormValue } from './components/TeacherPicker/models';
import * as consts from './consts';

export const initialTeacherState = (): TeacherFormValue => ({ kind: 'named', name: '' });

export const teacherFromCourse = (course: CourseResponse): TeacherFormValue =>
  course.teacher.kind === 'rabbi' ? { kind: 'rabbi', rabbi: course.teacher.rabbi } : { kind: 'named', name: course.teacher.name };

export const pageHeading = (isEditing: boolean): string => (isEditing ? consts.EDIT_HEADING : consts.NEW_HEADING);

export const validateTeacher = (teacher: TeacherFormValue): string | undefined =>
  teacher.kind === 'named' && !teacher.name.trim() ? teacherPickerConsts.REQUIRED_TEACHER_ERROR : undefined;

const buildTeacherInput = (teacher: TeacherFormValue): CourseTeacherInput =>
  teacher.kind === 'rabbi' ? { kind: 'rabbi', rabbiId: teacher.rabbi.id } : { kind: 'named', name: teacher.name.trim() };

// Assumes both the shared fields and the teacher already passed validation.
export const buildAdminCoursePayload = (form: CourseFormState, teacher: TeacherFormValue): CreateCourseRequest => ({
  ...buildCoursePayload(form),
  teacher: buildTeacherInput(teacher),
});
