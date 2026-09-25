import { courseErrorMessage, isCourseErrorCode } from '~/courseErrors';

import { RabbiApiError } from './api';
import * as consts from './consts';

// Status-aware, with per-call overrides keyed by the server's `error` code
// first and its HTTP status second, mirroring `AdminPanel/helpers.ts`'s
// `adminErrorMessage`. Never renders the raw server message: a course error
// code goes through `~/courseErrors.ts` instead, which builds its own
// approved Hebrew from the code and its details (spec section 13), not from
// the server's own message string.
export const rabbiErrorMessage = (error: unknown, overrides: Partial<Record<string | number, string>> = {}): string => {
  if (!(error instanceof RabbiApiError)) return consts.GENERIC_ERROR_MESSAGE;

  const byCode = error.code ? overrides[error.code] : undefined;
  if (byCode !== undefined) return byCode;

  if (isCourseErrorCode(error.code)) return courseErrorMessage(error.code, error.details);

  const byStatus = overrides[error.status];
  if (byStatus !== undefined) return byStatus;

  if (error.status === 0) return consts.NETWORK_ERROR_MESSAGE;
  if (error.status === 401) return consts.UNAUTHENTICATED_MESSAGE;
  if (error.status === 429) return consts.RATE_LIMITED_MESSAGE;
  if (error.status === 404) return consts.NOT_FOUND_MESSAGE;
  if (error.status === 400) return consts.INVALID_REQUEST_MESSAGE;
  return consts.GENERIC_ERROR_MESSAGE;
};

// The shape `~/hooks/useCourseCoverUpload.ts` and `~/hooks/useCourseGalleryPhotos.ts`
// read a failed upload's code and details through, since those hooks are
// shared with the admin panel and never import either panel's own error
// class by name.
export const describeRabbiError = (error: unknown): { code?: string; details?: unknown; status: number } | undefined =>
  error instanceof RabbiApiError ? { code: error.code, details: error.details, status: error.status } : undefined;
