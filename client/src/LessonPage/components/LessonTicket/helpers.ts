import type { LessonOccurrence } from '@torabarabim/common';

import { LESSON_TOPIC_LABELS } from '~/HomePage/components/LessonCard/consts';
import { SUBSTITUTE_ROLE_LABEL, TEACHING_RABBI_ROLE_LABEL } from '~/LessonPage/consts';

const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';
const weekdayFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'long', timeZone: ISRAEL_TIME_ZONE });
const monthFormatter = new Intl.DateTimeFormat('he-IL', { month: 'long', timeZone: ISRAEL_TIME_ZONE });
const dayNumberFormatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', timeZone: ISRAEL_TIME_ZONE });

export const weekdayLabel = (isoDate: string): string => weekdayFormatter.format(new Date(`${isoDate}T00:00:00Z`));
export const dayNumberLabel = (isoDate: string): string => dayNumberFormatter.format(new Date(`${isoDate}T00:00:00Z`));

// "13 בספטמבר", never "13 ספטמבר": Hebrew always prefixes a month name with
// ב when it follows a day number, even split across the date column's own
// lines.
export const monthLabel = (isoDate: string): string => `ב${monthFormatter.format(new Date(`${isoDate}T00:00:00Z`))}`;

// 'HH:mm' to minutes past midnight. `LessonOccurrence.startTime`/`endTime`
// are always this shape server-side (server/src/service/lesson/models.ts),
// so a malformed part falls back to 0 rather than propagating `NaN`.
const minutesPastMidnight = (clockTime: string): number => {
  const [hour, minute] = clockTime.split(':');
  return Number(hour ?? 0) * 60 + Number(minute ?? 0);
};

// `durationMinutes` is not on the wire (design spec): computed here from the
// two clock times the occurrence does carry. Wrapping past midnight keeps
// the maths correct even though no real lesson does that today.
export const computeDurationMinutes = (startTime: string, endTime: string): number => {
  const startTotal = minutesPastMidnight(startTime);
  const endTotal = minutesPastMidnight(endTime);
  return endTotal >= startTotal ? endTotal - startTotal : endTotal + 24 * 60 - startTotal;
};

// Leads with a Hebrew word rather than the digit: a string starting with a
// digit flips once it meets the surrounding Hebrew text (design spec).
export const durationLabel = (minutes: number): string => `משך ${minutes} דקות`;

// No comma when there is no floor (design spec).
export const addressLine = (street: string, floor: string | undefined): string => (floor ? `${street}, ${floor}` : street);

// "עד 22:00": the occurrence's own end time, shown next to the start time
// rather than left to the duration line to imply it.
export const endTimeLabel = (endTime: string): string => `עד ${endTime}`;

// The lesson's own title or topic, shown as the ticket's kicker regardless of
// who is teaching: a substitute changes who is speaking, never what the
// lesson is about, so this stays independent of `roleLabel` below. Both
// fields are individually optional, so a lesson with neither has no kicker.
export const kickerLabel = (occurrence: LessonOccurrence): string | undefined =>
  occurrence.title ?? (occurrence.topic ? LESSON_TOPIC_LABELS[occurrence.topic] : undefined);

// The label above the rabbi's name: what the lecturer is called normally,
// versus what to call the fact that this occurrence has a substitute. Its
// own slot, never sharing one with `kickerLabel`.
export const roleLabel = (isSubstitute: boolean): string => (isSubstitute ? SUBSTITUTE_ROLE_LABEL : TEACHING_RABBI_ROLE_LABEL);
