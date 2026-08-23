import type { RabbiLessonResponse, Weekday } from '@torabarabim/common';

import * as consts from './consts';

const compactDateFormatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', timeZone: 'UTC' });

// A single weekday reads as `כל יום שלישי`; more than one is a plain,
// comma-separated list of bare names (`ראשון, שלישי`), matching the
// mockup exactly rather than the admin list's run-collapsing-with-"ו"
// convention, which the design doc does not ask this screen to reproduce.
const weeklyWhenLabel = (weekdays: Weekday[]): string => {
  const [onlyDay] = weekdays;
  if (weekdays.length === 1 && onlyDay !== undefined) return `כל יום ${consts.WEEKDAY_LABELS[onlyDay]}`;
  return weekdays.map((weekday) => consts.WEEKDAY_LABELS[weekday]).join(', ');
};

// The lesson's own "מתי" line: `כל יום שלישי · 20:00 · 45 דקות` for a
// recurring lesson, or `22 בספטמבר · 19:00 · 90 דקות` for a one-time one.
export const whenLabel = (lesson: RabbiLessonResponse): string => {
  const schedulePart =
    lesson.recurrence.kind === 'weekly'
      ? weeklyWhenLabel(lesson.recurrence.weekdays)
      : compactDateFormatter.format(new Date(`${lesson.recurrence.date}T00:00:00Z`));
  return `${schedulePart} · ${lesson.startTime} · ${lesson.durationMinutes} דקות`;
};

// Matches the public `LessonCard`'s rule for the title itself (own title
// leads), but the fallback here is the lesson's kind, never a name: this
// screen never shows the rabbi's name on a card (design doc, section 4),
// since it is always the same rabbi.
export const lessonPrimaryLabel = (lesson: RabbiLessonResponse): string =>
  lesson.title ?? (lesson.recurrence.kind === 'weekly' ? consts.RECURRING_FALLBACK_TITLE : consts.ONE_TIME_FALLBACK_TITLE);
