import type { CityDirectoryResponse } from '@torabarabim/common';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message`, mirroring HomePage/api.ts's HomeApiError.
export class CitiesPageApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'CitiesPageApiError';
  }
}

// GET /v1/cities/directory, no parameters.
// 200 with CityDirectoryResponse, holding only areas and cities that
// actually have a lesson.
// 5xx for a server or upstream failure.
export const fetchCityDirectory = async (signal?: AbortSignal): Promise<CityDirectoryResponse> => {
  const url = new URL('/v1/cities/directory', window.location.origin);

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new CitiesPageApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new CitiesPageApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as CityDirectoryResponse;
};
