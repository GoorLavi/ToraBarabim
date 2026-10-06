import type { CreateVisitorMessageRequest } from '@torabarabim/common';

// Carries the HTTP status so a caller can map it to copy without parsing
// `message`. Status 0 marks a request that never reached the server.
export class VisitorMessageApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'VisitorMessageApiError';
  }
}

// POST /v1/visitor-messages
// 204 when the message is stored, whether or not the team's alert went out.
// 400 for an invalid body (a field over its limit, a phone the server
// rejects, or a subject on a help request), 5xx when it could not be stored.
// The error messages name the route and the status only: the body holds a
// name, a phone and a message, and none of them goes into an error.
export const sendVisitorMessage = async (body: CreateVisitorMessageRequest): Promise<void> => {
  const url = new URL('/v1/visitor-messages', window.location.origin);

  let response: Response;
  try {
    response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch (error) {
    throw new VisitorMessageApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new VisitorMessageApiError(response.status, `POST ${url.toString()} returned ${response.status}`);
  }
};
