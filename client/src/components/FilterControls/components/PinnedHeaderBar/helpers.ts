import { numericDayLabel, resolveTargetDate } from '~/HomePage/helpers';
import type { DateFilterOption, SelectedCity } from '~/hooks/models';

import * as consts from './consts';

// Order is fixed: date, city, search. `resolveTargetDate` already resolves
// today/tomorrow/shabbat/custom to one ISO date, and `numericDayLabel`
// already prefers the named-day word over the numeric form for the first
// three, so this needs no separate lookup for them.
export const filterSummaryLabel = (
  option: DateFilterOption,
  customDate: string | undefined,
  city: SelectedCity | undefined,
  searchQuery: string,
): string | undefined => {
  const segments = [
    option === 'all' ? undefined : numericDayLabel(resolveTargetDate(option, customDate)),
    city?.name,
    searchQuery ? consts.searchSummarySegment(searchQuery) : undefined,
  ].filter((segment): segment is string => Boolean(segment));

  return segments.length > 0 ? segments.join(consts.SUMMARY_SEGMENT_SEPARATOR) : undefined;
};
