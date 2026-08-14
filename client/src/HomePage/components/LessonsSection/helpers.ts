import type { LessonOccurrence } from '@torabarabim/common';

import type { HomeApiError } from '~/HomePage/api';

import {
  INVALID_REQUEST_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  SERVER_ERROR_MESSAGE,
} from './consts';
import type { DaySection } from './models';

// Section headings name the city when one is chosen and stay city-less in
// the "all areas" state (design-system.md, "No default city").
export const dayHeadingLabel = (dayLabel: string, cityName: string | undefined): string =>
  cityName ? `${dayLabel} ב${cityName}` : dayLabel;

// Status-aware: reads `error.status`, never the raw message the server
// sent, so a network failure with no status still gets sensible Hebrew copy.
export const getErrorMessage = (error: HomeApiError | null): string => {
  if (!error) return SERVER_ERROR_MESSAGE;
  if (error.status === 0) return NETWORK_ERROR_MESSAGE;
  if (error.status === 400) return INVALID_REQUEST_MESSAGE;
  return SERVER_ERROR_MESSAGE;
};

// The ratified empty state (design-system.md, "Every data screen has three
// states"): when the target day has nothing, this widens forward, one axis
// at a time, to the next day within the fetched window that has any
// lessons. `items` is expected pre-sorted by date, which `GET /v1/lessons`
// already guarantees.
export const selectDaySections = (
  items: LessonOccurrence[],
  targetDate: string,
): { primary: DaySection; fallback: DaySection | undefined } => {
  const primaryItems = items.filter((item) => item.date === targetDate);

  if (primaryItems.length > 0) {
    return { primary: { date: targetDate, items: primaryItems }, fallback: undefined };
  }

  const fallbackDate = items.find((item) => item.date > targetDate)?.date;
  const fallbackItems = fallbackDate ? items.filter((item) => item.date === fallbackDate) : [];

  return {
    primary: { date: targetDate, items: [] },
    fallback: fallbackDate ? { date: fallbackDate, items: fallbackItems } : undefined,
  };
};
