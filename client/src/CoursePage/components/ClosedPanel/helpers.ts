import type { CloseReason } from '@torabarabim/common';

import { courseOpeningDateLongLabel, israelDayMonthLabel, joinWithMiddleDot, weeksPhrase } from '~/helpers';

// Closed by the calendar or by hand: "הקורס נפתח ב־3 בנובמבר ונמשך 10
// שבועות." (spec section 13's own wording). Marked full: "פתיחה ב־3 בנובמבר
// · 10 שבועות" (design brief A, item 14), a different sentence for a
// different fact (this course never actually closed on its own).
export const closedFactLine = (reason: CloseReason, openingDate: string, weeks: number): string => {
  if (reason === 'full') return joinWithMiddleDot([courseOpeningDateLongLabel(openingDate), weeksPhrase(weeks)]);
  return `הקורס נפתח ב־${israelDayMonthLabel(openingDate)} ונמשך ${weeksPhrase(weeks)}.`;
};
