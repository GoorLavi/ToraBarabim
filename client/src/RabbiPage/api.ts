import type { LessonSearchResponse, RabbiDetailResponse } from '@torabarabim/common';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message`, mirroring LessonPage/api.ts's LessonPageApiError.
// Status 0 marks a request that never reached the server.
export class RabbiPageApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'RabbiPageApiError';
  }
}

const fetchJson = async <T>(url: URL, signal?: AbortSignal): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new RabbiPageApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new RabbiPageApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as T;
};

// GET /v1/rabbis/:rabbiId
// 200 with RabbiDetailResponse.
// 404 when the rabbi does not exist.
// 5xx for a server or upstream failure.
export const fetchRabbiDetail = (rabbiId: string, signal?: AbortSignal): Promise<RabbiDetailResponse> =>
  fetchJson(new URL(`/v1/rabbis/${encodeURIComponent(rabbiId)}`, window.location.origin), signal);

// GET /v1/lessons
// 200 with LessonSearchResponse, including an empty result set: a real
// rabbi or a real city with no lessons is a 200, never a 404.
// 400 for an invalid query.
// 5xx for a server or upstream failure.
export const fetchLessons = (
  params: { rabbiId?: string; pageSize?: number },
  signal?: AbortSignal,
): Promise<LessonSearchResponse> => {
  const url = new URL('/v1/lessons', window.location.origin);
  if (params.rabbiId) url.searchParams.set('rabbiId', params.rabbiId);
  if (params.pageSize) url.searchParams.set('pageSize', String(params.pageSize));
  return fetchJson(url, signal);
};
