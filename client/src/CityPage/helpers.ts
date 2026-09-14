import type { CityPageApiError } from './api';
import * as consts from './consts';

export type CityErrorCopy =
  | { kind: 'not-found'; heading: string; body: string }
  | { kind: 'error'; heading: string; body: string };

// A 404 is a fact about the name, so its screen offers a way out. Every
// other failure is transient, so its screen offers a retry (mirrors
// RabbiPage/helpers.ts, rabbiErrorCopy).
export const cityErrorCopy = (error: CityPageApiError | null): CityErrorCopy => {
  if (error?.status === 404) {
    return { kind: 'not-found', heading: consts.NOT_FOUND_HEADING, body: consts.NOT_FOUND_BODY };
  }
  return { kind: 'error', heading: consts.ERROR_HEADING, body: consts.ERROR_BODY };
};
