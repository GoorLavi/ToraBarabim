import type { Weekday } from '@torabarabim/common';

import { WEEKDAY_NAMES } from './consts';

// Parses a Hebrew weekday name such as "יום שלישי" or "יום א'" into a
// Weekday. Pure: no network, no clock. Returns undefined if nothing in the
// text matches a known day name, rather than guessing one.
export const parseWeekday = (text: string): Weekday | undefined => {
  const cleaned = text
    .replace(/יום/g, '')
    .replace(/['"׳״]/g, '')
    .trim();

  return WEEKDAY_NAMES[cleaned];
};
