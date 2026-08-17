import { AdminApiError } from './api';
import * as consts from './consts';

// Status-aware, with per-call overrides keyed by the server's `error` code
// first and its HTTP status second, so a caller can surface e.g.
// 'unknown_rabbi' against a specific field while everything else falls
// back to generic, calm Hebrew copy. Never renders the raw server message.
export const adminErrorMessage = (error: unknown, overrides: Partial<Record<string | number, string>> = {}): string => {
  if (!(error instanceof AdminApiError)) return consts.GENERIC_ERROR_MESSAGE;

  const byCode = error.code ? overrides[error.code] : undefined;
  if (byCode !== undefined) return byCode;

  const byStatus = overrides[error.status];
  if (byStatus !== undefined) return byStatus;

  if (error.status === 0) return consts.NETWORK_ERROR_MESSAGE;
  if (error.status === 401) return consts.UNAUTHENTICATED_MESSAGE;
  if (error.status === 429) return consts.RATE_LIMITED_MESSAGE;
  if (error.status === 404) return consts.NOT_FOUND_MESSAGE;
  if (error.status === 400) return consts.INVALID_REQUEST_MESSAGE;
  return consts.GENERIC_ERROR_MESSAGE;
};
