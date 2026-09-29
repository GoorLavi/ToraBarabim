import type { CourseDetailResponse } from '@torabarabim/common';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message`, mirroring LessonPage/api.ts's LessonPageApiError.
// Status 0 marks a request that never reached the server.
export class CoursePageApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'CoursePageApiError';
  }
}

// GET /v1/courses/:id
// 200 with CourseDetailResponse.
// 404 when the course does not exist or is unpublished.
// 5xx for a server or upstream failure.
export const fetchCourseDetail = async (courseId: string, signal?: AbortSignal): Promise<CourseDetailResponse> => {
  const url = new URL(`/v1/courses/${encodeURIComponent(courseId)}`, window.location.origin);

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new CoursePageApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new CoursePageApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as CourseDetailResponse;
};
