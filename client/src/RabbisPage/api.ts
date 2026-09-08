import type { RabbiDirectoryResponse } from '@torabarabim/common';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message`, mirroring HomePage/api.ts's HomeApiError.
export class RabbisPageApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'RabbisPageApiError';
  }
}

// GET /v1/rabbis?page&pageSize
// 200 with one page of RabbiDirectoryResponse, including an empty result set.
// 400 for an invalid page or pageSize.
// 5xx for a server or upstream failure.
export const fetchRabbiDirectoryPage = async (page: number, pageSize: number, signal?: AbortSignal): Promise<RabbiDirectoryResponse> => {
  const url = new URL('/v1/rabbis', window.location.origin);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new RabbisPageApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new RabbisPageApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as RabbiDirectoryResponse;
};
