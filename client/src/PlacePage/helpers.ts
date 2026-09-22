import type { PlacePageApiError } from './api';
import * as consts from './consts';

// A 404 is a fact about the place, so its screen offers a way out. Every
// other failure is transient, so its screen offers a retry (mirrors
// CityPage/helpers.ts, cityErrorCopy).
export type PlaceErrorCopy =
  | { kind: 'not-found'; heading: string; body: string }
  | { kind: 'error'; heading: string; body: string };

export const placeErrorCopy = (error: PlacePageApiError | null): PlaceErrorCopy => {
  if (error?.status === 404) {
    return { kind: 'not-found', heading: consts.NOT_FOUND_HEADING, body: consts.NOT_FOUND_BODY };
  }
  return { kind: 'error', heading: consts.ERROR_HEADING, body: consts.ERROR_BODY };
};
