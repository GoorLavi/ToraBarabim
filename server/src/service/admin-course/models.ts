import { z } from 'zod';

import { COURSE_TEACHER_NAME_MAX_LENGTH, DEFAULT_COURSE_PAGE, DEFAULT_COURSE_PAGE_SIZE, MAX_COURSE_PAGE_SIZE } from '../course/consts';
import { courseFieldsSchema } from '../shared/models';

// The three buckets the approved filter shows, not the lifecycle's own
// three-value status: `open` covers both `notOpen` and `open` ("ההרשמה
// פתוחה"), and a closed course splits by its own `reason` into `full`
// ("תפוסה מלאה") and `closed` ("ההרשמה נסגרה").
const COURSE_STATUSES = ['open', 'full', 'closed'] as const;

// `q` matches across course name, teacher, rabbi, place and address (the
// admin's own free-text search, checked by hand: see the test plan's
// "deliberately not written" list). `status` is a computed value, not a
// column, so it is applied in memory after the lifecycle is resolved for
// every row, same as the closed-group sort.
export const adminCourseListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  status: z.enum(COURSE_STATUSES).optional(),
  rabbiId: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_COURSE_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_COURSE_PAGE_SIZE).default(DEFAULT_COURSE_PAGE_SIZE),
});
export type AdminCourseListQuery = z.infer<typeof adminCourseListQuerySchema>;

// Mirrors the wire `CourseTeacherInput`: a linked rabbi, or free text for an
// unlinked course. The unenforced honorific and free audience on the
// unlinked shape are the accepted gap in spec 12, item 5.
export const courseTeacherInputSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('rabbi'), rabbiId: z.string().trim().min(1) }),
  z.object({ kind: z.literal('named'), name: z.string().trim().min(1).max(COURSE_TEACHER_NAME_MAX_LENGTH) }),
]);
export type CourseTeacherInput = z.infer<typeof courseTeacherInputSchema>;

export const createCourseSchema = courseFieldsSchema.extend({ teacher: courseTeacherInputSchema });
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export const updateCourseSchema = createCourseSchema;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
