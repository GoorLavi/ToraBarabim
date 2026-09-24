import type { CloseReason } from '@torabarabim/common';

import { israelDayMonthLabel, joinWithMiddleDot } from '~/helpers';

const NBSP = ' ';
const weeksPhrase = (weeks: number): string => (weeks === 1 ? 'שבוע אחד' : `${weeks}${NBSP}שבועות`);

// Closed by the calendar or by hand: "הקורס נפתח ב־3 בנובמבר ונמשך 10
// שבועות." (spec section 13's own wording). Marked full: "פתיחה ב־3 בנובמבר
// · 10 שבועות" (design brief A, item 14), a different sentence for a
// different fact (this course never actually closed on its own). Not built
// on `courseOpeningDateLongLabel` (~/helpers.ts): that helper's own prefix
// is "פתיחה ב־" without a verb, which only the `full` line wants.
export const closedFactLine = (reason: CloseReason, openingDate: string, weeks: number): string => {
  const dateLabel = israelDayMonthLabel(openingDate);
  if (reason === 'full') return joinWithMiddleDot([`פתיחה ב־${dateLabel}`, weeksPhrase(weeks)]);
  return `הקורס נפתח ב־${dateLabel} ונמשך ${weeksPhrase(weeks)}.`;
};
