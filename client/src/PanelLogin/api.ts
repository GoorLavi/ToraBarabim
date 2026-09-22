import type { PanelLoginResponse } from '@torabarabim/common';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Carries the HTTP status and, when the server sent one, its `error` code,
// so a caller can react to a specific failure without parsing `message`
// (client/CLAUDE.md, Data and State). Status 0 marks a request that never
// reached the server. Mirrors `RabbiPanel/api.ts`'s `RabbiApiError` and
// `AdminPanel/api.ts`'s `AdminApiError`: kept as its own class since this
// feature owns a single call, not a whole panel's worth of endpoints.
export class PanelApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'PanelApiError';
  }
}

const parseErrorBody = async (response: Response): Promise<{ code?: string }> => {
  try {
    const body: unknown = await response.json();
    const code = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string' ? body.error : undefined;
    return { code };
  } catch {
    return {};
  }
};

const url = (path: string): URL => new URL(path, window.location.origin);

// POST /v1/panel/login
// 200 with PanelLoginResponse on success, sets the session cookie for
// whichever role the account turned out to be (rabbi or place; an admin's
// own credentials are refused here with the same 401 as a wrong password).
// `identifier` is either the account's email or its username; `from` is the
// path the visitor was on before being sent here, echoed back validated as
// `landingPath`.
// 401 invalid_credentials. 403 account_deactivated. 429 rate limited.
export const login = async (body: { identifier: string; password: string; from?: string }): Promise<PanelLoginResponse> => {
  let response: Response;
  try {
    response = await fetch(url('/v1/panel/login').toString(), {
      method: 'POST',
      headers: JSON_HEADERS,
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new PanelApiError(0, undefined, `failed to reach /v1/panel/login: ${String(error)}`);
  }

  if (!response.ok) {
    const { code } = await parseErrorBody(response);
    throw new PanelApiError(response.status, code, `POST /v1/panel/login returned ${response.status}`);
  }

  return (await response.json()) as PanelLoginResponse;
};
