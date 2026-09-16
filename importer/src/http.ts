import type { ImporterConfig } from './models';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`Agent import API responded ${status}: ${JSON.stringify(body)}`);
    this.name = 'ApiError';
  }
}

// Reads the response body as text first and only then attempts to parse
// it as JSON: an error response is not guaranteed to be JSON (a proxy in
// front of the API, or a crash before the server's own JSON error
// handler ran, can both hand back plain text or HTML), and a raw
// `response.json()` would throw a confusing parse error that hides the
// real HTTP status entirely.
const parseResponseBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

// The key is read from config and sent as a header; it is never included in
// a log line, an error message, or anything printed to stdout.
export const postJson = async <T>(config: ImporterConfig, path: string, body: unknown): Promise<T> => {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${config.agentKey}` },
    body: JSON.stringify(body),
  });
  const parsed = await parseResponseBody(response);
  if (!response.ok) throw new ApiError(response.status, parsed);
  return parsed as T;
};

export const getJson = async <T>(config: ImporterConfig, path: string): Promise<T> => {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    headers: { authorization: `Bearer ${config.agentKey}` },
  });
  const parsed = await parseResponseBody(response);
  if (!response.ok) throw new ApiError(response.status, parsed);
  return parsed as T;
};
