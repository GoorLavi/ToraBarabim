import type { Lesson, LessonListResponse, RabbiListResponse } from '@torabarabim/common';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { recurrenceWhenLabel } from '~/AdminPanel/helpers';
import { venuePanelCityName } from '~/helpers';

import type { AdminLessonRow, RabbiFilterValue, RecurrenceFilter } from './models';
import * as consts from './consts';

// One line for a row's day and start time, joined the same way as
// RabbiLessonsSection's `lessonRowMetaLabel`: shared by `LessonsCardList`
// and `LessonsTable`, the two children that each render it beside their own
// recurrence tag.
export const lessonDayTimeLabel = (lesson: Pick<Lesson, 'recurrence' | 'startTime'>): string => `${recurrenceWhenLabel(lesson)} · ${lesson.startTime}`;

// The venue lives on the lesson itself now, so joining a row is just
// attaching its rabbi; there is no separate place record to look up.
export const joinLessonRows = (lessons: LessonListResponse['items'], rabbis: RabbiListResponse['items']): AdminLessonRow[] => {
  const rabbiMap = new Map(rabbis.map((rabbi) => [rabbi.id, rabbi]));
  return lessons.map((lesson) => ({ lesson, rabbi: rabbiMap.get(lesson.rabbiId) }));
};

// Ranks a lesson by how soon its next occurrence is, counting today as 0.
// A one-time lesson whose date has already passed sorts last: it is not
// "coming up" for anyone reading this list.
export const soonestOffsetDays = (lesson: Pick<Lesson, 'recurrence'>, today: Date): number => {
  if (lesson.recurrence.kind === 'once') {
    const date = new Date(`${lesson.recurrence.date}T00:00:00Z`);
    const diff = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : Number.MAX_SAFE_INTEGER;
  }
  const todayWeekday = today.getUTCDay();
  const offsets = lesson.recurrence.weekdays.map((weekday) => (weekday - todayWeekday + 7) % 7);
  return Math.min(...offsets);
};

export const sortRowsBySoonest = (rows: AdminLessonRow[]): AdminLessonRow[] => {
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
  return [...rows].sort((a, b) => soonestOffsetDays(a.lesson, today) - soonestOffsetDays(b.lesson, today));
};

const rowMatchesRecurrence = (row: AdminLessonRow, filter: RecurrenceFilter): boolean => {
  if (filter === 'all') return true;
  return row.lesson.recurrence.kind === filter;
};

const rowMatchesSearch = (row: AdminLessonRow, search: string): boolean => {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  const haystack = [row.lesson.title, row.rabbi?.name, row.lesson.venue.name, row.lesson.venue.street, venuePanelCityName(row.lesson.venue)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
};

// The server's `GET /v1/admin/lessons` has no text-search or recurrence
// filter param today (see this slice's report), so both are applied here,
// client-side, over whatever page is already loaded.
export const filterRows = (rows: AdminLessonRow[], recurrence: RecurrenceFilter, search: string): AdminLessonRow[] =>
  rows.filter((row) => rowMatchesRecurrence(row, recurrence) && rowMatchesSearch(row, search));

// The one place this screen's filtered URL is built from a rabbi record
// (`RabbiViewPage`'s "see all" overflow link is the only caller): keeps the
// three param names in one place rather than a second hand-built query
// string drifting from `useLessonListFilters`'s reader.
export const lessonsListUrlForRabbi = (rabbi: RabbiFilterValue): string => {
  const params = new URLSearchParams({
    [consts.RABBI_ID_PARAM]: rabbi.id,
    [consts.RABBI_NAME_PARAM]: rabbi.name,
    [consts.RABBI_HONORIFIC_PARAM]: rabbi.honorific,
  });
  return `${ADMIN_ROUTES.lessons}?${params.toString()}`;
};
