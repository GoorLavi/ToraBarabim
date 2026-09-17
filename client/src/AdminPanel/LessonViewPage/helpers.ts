import type { Lesson, Weekday } from '@torabarabim/common';

import { WEEKDAY_LABELS } from '~/AdminPanel/consts';

// `Date#getUTCDay` is specified to always return 0-6, so this narrowing
// from `number` to the `Weekday` literal union is safe by construction.
const asWeekday = (day: number): Weekday => day as Weekday;

// Feeds the live public preview from a saved, always-valid `Lesson`, unlike
// `LessonFormPage/helpers.ts`'s `previewWeekdayLabel`, which tolerates an
// incomplete draft. Deliberately a plain weekday name (or list of them),
// not the "כל ..." phrasing `AdminPanel/helpers.ts`'s `recurrenceWhenLabel`
// builds for the fields grid: the preview medallion has its own line for
// the time, so it only needs the day.
export const weekdayLabelForPreview = (lesson: Lesson): string => {
  if (lesson.recurrence.kind === 'weekly') {
    return lesson.recurrence.weekdays.map((weekday) => WEEKDAY_LABELS[weekday]).join(' / ');
  }
  const weekday = asWeekday(new Date(`${lesson.recurrence.date}T00:00:00Z`).getUTCDay());
  return WEEKDAY_LABELS[weekday];
};
