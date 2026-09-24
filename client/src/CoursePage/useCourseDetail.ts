import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { CourseDetailResponse } from '@torabarabim/common';

import { CoursePageApiError, fetchCourseDetail } from './api';
import { COURSE_PAGE_QUERY_KEYS, COURSE_PAGE_RETRY_LIMIT } from './consts';

export const useCourseDetail = (courseId: string): UseQueryResult<CourseDetailResponse, CoursePageApiError> =>
  useQuery({
    queryKey: COURSE_PAGE_QUERY_KEYS.detail(courseId),
    queryFn: ({ signal }) => fetchCourseDetail(courseId, signal),
    enabled: courseId.length > 0,
    // A 404 is a fact about the course, not a transient failure: retrying it
    // only delays reaching the not-found screen.
    retry: (failureCount, error) => error.status !== 404 && failureCount < COURSE_PAGE_RETRY_LIMIT,
  });
