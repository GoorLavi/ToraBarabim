import type { CreateVisitorMessageRequest } from '@torabarabim/common';

import { HomeApiError } from '~/HomePage/api';

// POST /v1/visitor-messages
// 204 when the message is stored, whether or not the team's alert went out.
// 400 for an invalid body (a field over its limit or a phone the server
// rejects), 5xx when it could not be stored.
// The error messages name the route and the status only: the body holds a
// name, a phone and a message, and none of them goes into an error.
export const sendVisitorMessage = async (body: CreateVisitorMessageRequest): Promise<void> => {
  const url = new URL('/v1/visitor-messages', window.location.origin);

  let response: Response;
  try {
    response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch (error) {
    throw new HomeApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new HomeApiError(response.status, `POST ${url.toString()} returned ${response.status}`);
  }
};
