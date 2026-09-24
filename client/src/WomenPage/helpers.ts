import type { CourseSummary } from '@torabarabim/common';

import { addDays, compactDayLabel, resolveTargetDate } from '~/HomePage/helpers';
import { LESSON_WINDOW_DAYS } from '~/HomePage/consts';
import type { DateFilterOption, SelectedCity } from '~/hooks/models';
import { dateWord } from '~/LessonsPage/helpers';

import type { WomenLessonsRange } from './models';

// The server does the range: no date chosen widens to the same rolling
// window the home page's rail uses (`LESSON_WINDOW_DAYS`, shared rather
// than retyped); a date chosen narrows to that single day, `from` and `to`
// both the same date. `resolveTargetDate` is the header date filter's own
// day-resolution, reused rather than copied a second time.
export const resolveWindow = (option: DateFilterOption, customDate: string | undefined): WomenLessonsRange => {
  const target = resolveTargetDate(option, customDate);
  if (option === 'all') return { from: target, to: addDays(target, LESSON_WINDOW_DAYS) };
  return { from: target, to: target };
};

// Whether a date chip or a search term is active: the one axis that routes
// an empty result to the filtered-empty state instead of the
// empty-with-city or empty-with-nothing state (WomenPage.tsx).
export const hasSearchOrDateFilter = (option: DateFilterOption, query: string): boolean => option !== 'all' || Boolean(query);

// The day label both the subheading and the filtered-empty state read:
// "השבת" here, not compactDayLabel's own "בשבת", since both sentences this
// feeds already read "... <word>" rather than "...on Shabbat". Every other
// date reuses `dateWord`'s existing maqaf-fixed form unchanged.
export const dateLabel = (isoDate: string): string => {
  const label = compactDayLabel(isoDate);
  if (label === 'היום' || label === 'מחר') return label;
  if (label === 'בשבת') return 'השבת';
  return dateWord(isoDate);
};

// Filtered by the chosen city, matched on the resolved city name: neither
// `SelectedCity` nor `LessonVenue` carries a field the other also has
// (`SelectedCity.id` is not `LessonVenue.citySlug`), so the name, which
// both do carry, is the one comparable field between them. No city
// selected shows every course in scope.
export const coursesForCity = (courses: CourseSummary[], city: SelectedCity | undefined): CourseSummary[] =>
  city ? courses.filter((course) => course.venue.city === city.name) : courses;
