import type { LessonOccurrence } from '@torabarabim/common';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message`, mirroring HomePage/api.ts's HomeApiError. Status 0
// marks a request that never reached the server.
export class LessonPageApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'LessonPageApiError';
  }
}

// GET /v1/lessons/:lessonId/occurrences/:date
// 200 with a single LessonOccurrence, not wrapped in `{ items }`. A
// cancelled occurrence is still a 200: cancellation is data, not an error.
// 400 for a malformed id or date.
// 404 when the lesson does not exist, or exists with no occurrence on that
// date: both return the identical body and are not distinguishable here.
// 5xx for a server or upstream failure.
export const fetchLessonOccurrence = async (lessonId: string, date: string, signal?: AbortSignal): Promise<LessonOccurrence> => {
  const url = new URL(
    `/v1/lessons/${encodeURIComponent(lessonId)}/occurrences/${encodeURIComponent(date)}`,
    window.location.origin,
  );

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    throw new LessonPageApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new LessonPageApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as LessonOccurrence;
};
