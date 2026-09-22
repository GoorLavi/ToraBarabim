import type { PlaceLessonResponse, Weekday } from '@torabarabim/common';

import * as consts from './consts';

const compactDateFormatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', timeZone: 'UTC' });

// A single weekday reads as `כל יום שלישי`; more than one is a plain,
// comma-separated list of bare names, mirroring
// `RabbiPanel/LessonsListPage/helpers.ts`'s own `weeklyWhenLabel` exactly.
const weeklyWhenLabel = (weekdays: Weekday[]): string => {
  const [onlyDay] = weekdays;
  if (weekdays.length === 1 && onlyDay !== undefined) return `כל יום ${consts.WEEKDAY_LABELS[onlyDay]}`;
  return weekdays.map((weekday) => consts.WEEKDAY_LABELS[weekday]).join(', ');
};

// The lesson's own "מתי" line, mirroring `RabbiPanel/LessonsListPage/helpers.ts`'s `whenLabel` exactly.
export const whenLabel = (lesson: PlaceLessonResponse): string => {
  const schedulePart =
    lesson.recurrence.kind === 'weekly'
      ? weeklyWhenLabel(lesson.recurrence.weekdays)
      : compactDateFormatter.format(new Date(`${lesson.recurrence.date}T00:00:00Z`));
  return `${schedulePart} · ${lesson.startTime} · ${lesson.durationMinutes} דקות`;
};

// Matches the public `LessonCard`'s rule for the title itself (own title
// leads), but the fallback here is the lesson's kind, never a name: this
// screen never shows the place's own name on a card, since it is always the
// same place. Mirrors `RabbiPanel/LessonsListPage/helpers.ts`'s
// `lessonPrimaryLabel`.
export const lessonPrimaryLabel = (lesson: PlaceLessonResponse): string =>
  lesson.title ?? (lesson.recurrence.kind === 'weekly' ? consts.RECURRING_FALLBACK_TITLE : consts.ONE_TIME_FALLBACK_TITLE);
