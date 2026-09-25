import * as consts from './consts';

export { buildCoursePayload, courseToFormState, initialFormState, validateCourseForm } from '~/components/CourseFormFields/helpers';

// A static heading per mode, not derived from the course's own name (mirrors
// LessonFormPage/helpers.ts, pageHeading).
export const pageHeading = (isEditing: boolean): string => (isEditing ? consts.EDIT_HEADING : consts.NEW_HEADING);
