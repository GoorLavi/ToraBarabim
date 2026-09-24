import type { CourseDetailResponse } from '@torabarabim/common';

import { toCourseDetailResponse } from '../../../../server/src/convertors/course';
import { CourseNotFoundError } from '../../../../server/src/service/course/errors';
import * as courseService from '../../../../server/src/service/course/course';
import { UNCACHEABLE_ERROR_HEADERS } from '../consts';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service and database
// code below is excluded from the browser bundle.
//
// `convertors/course.ts` is still landing on the server side (build tracker
// #2, in progress): this import is written against the plan's shape rather
// than worked around, and does not resolve until that file exists.
export const loadCourseDetail = async (courseId: string, now: Date): Promise<CourseDetailResponse> => {
  try {
    const record = await courseService.getPublicById(courseId, now);
    return toCourseDetailResponse(record);
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      throw new Response('הקורס לא נמצא', { status: 404, headers: UNCACHEABLE_ERROR_HEADERS });
    }
    console.error('Failed to load course detail', { courseId, error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
