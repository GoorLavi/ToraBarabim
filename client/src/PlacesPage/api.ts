import type { PlaceListResponse } from '@torabarabim/common';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message` (mirrors RabbisPage/api.ts's RabbisPageApiError).
export class PlacesPageApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'PlacesPageApiError';
  }
}

// GET /v1/places
// 200 with PlaceListResponse: every active place, unfiltered and unpaged
// (server/src/api/places/index.ts), including an empty result set.
// 5xx for a server or upstream failure.
export const fetchPlaceDirectory = async (signal?: AbortSignal): Promise<PlaceListResponse> => {
  const url = new URL('/v1/places', window.location.origin);

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new PlacesPageApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new PlacesPageApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as PlaceListResponse;
};
