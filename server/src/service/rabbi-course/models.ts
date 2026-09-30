import { z } from 'zod';

import { DEFAULT_COURSE_PAGE, DEFAULT_COURSE_PAGE_SIZE, MAX_COURSE_PAGE_SIZE } from '../course/consts';
import { courseFieldsSchema } from '../shared/models';

export const rabbiCourseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_COURSE_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_COURSE_PAGE_SIZE).default(DEFAULT_COURSE_PAGE_SIZE),
});
export type RabbiCourseListQuery = z.infer<typeof rabbiCourseListQuerySchema>;

// No teacher field: a rabbi can only ever write his own courses, so the
// owner is always the id on his session, never a value he sends.
export const createRabbiCourseSchema = courseFieldsSchema;
export type CreateRabbiCourseInput = z.infer<typeof createRabbiCourseSchema>;
export const updateRabbiCourseSchema = courseFieldsSchema;
export type UpdateRabbiCourseInput = z.infer<typeof updateRabbiCourseSchema>;
