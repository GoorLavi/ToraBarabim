import type { LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { HomeApiError } from '~/HomePage/api';
import { addDays, todayInIsrael } from '~/HomePage/helpers';

import { LessonsSection } from './LessonsSection';
import type { LessonSearchQueryState } from './models';

const TODAY = todayInIsrael();
const IN_THREE_DAYS = addDays(TODAY, 3);

const todayItems: LessonOccurrence[] = [
  {
    lessonId: 'lesson-1',
    date: TODAY,
    startTime: '20:30',
    endTime: '21:15',
    status: 'scheduled',
    title: 'עיונים בפרשת השבוע',
    topic: 'parasha',
    audience: 'mixed',
    rabbi: { id: 'rabbi-1', name: 'הרב יעקב מזרחי', title: 'דיין' },
    place: { id: 'place-1', name: 'בית הכנסת המרכזי', address: 'רחוב ויצמן 45', city: 'נתניה', area: 'sharon' },
  },
  {
    lessonId: 'lesson-2',
    date: TODAY,
    startTime: '06:00',
    endTime: '06:45',
    status: 'scheduled',
    title: 'דף יומי',
    topic: 'gemara',
    audience: 'men',
    rabbi: { id: 'rabbi-2', name: 'הרב אברהם כהן', title: 'ראש ישיבה' },
    place: { id: 'place-2', name: 'בית הכנסת "אוהל יעקב"', address: 'רחוב הרב קוק 12', city: 'נתניה', area: 'sharon' },
  },
];

const futureDayItems: LessonOccurrence[] = [
  {
    lessonId: 'lesson-9',
    date: IN_THREE_DAYS,
    startTime: '19:00',
    endTime: '19:45',
    status: 'scheduled',
    title: 'שיעור פתוח',
    topic: 'other',
    audience: 'women',
    rabbi: { id: 'rabbi-4', name: 'הרב שלמה אביטן' },
    place: { id: 'place-8', name: 'בית הכנסת "אור החיים"', address: 'רחוב טרומפלדור 5', city: 'נתניה', area: 'south' },
  },
];

const city = { id: '100', name: 'נתניה' };

const pendingQuery: LessonSearchQueryState = { isPending: true, isError: false, data: undefined, error: null, refetch: () => {} };

const errorQuery: LessonSearchQueryState = {
  isPending: false,
  isError: true,
  data: undefined,
  error: new HomeApiError(500, 'GET /v1/lessons returned 500'),
  refetch: () => {},
};

const populatedQuery: LessonSearchQueryState = {
  isPending: false,
  isError: false,
  data: { items: todayItems, page: 1, pageSize: 50, total: todayItems.length },
  error: null,
  refetch: () => {},
};

// The ratified empty state: today has nothing, so the screen names that and
// still shows the next day that has real lessons (design-system.md, "Every
// data screen has three states").
const emptyWithFallbackQuery: LessonSearchQueryState = {
  isPending: false,
  isError: false,
  data: { items: futureDayItems, page: 1, pageSize: 50, total: futureDayItems.length },
  error: null,
  refetch: () => {},
};

// Nothing anywhere in the whole widened window: the terminal case, still
// designed rather than a blank screen.
const terminalEmptyQuery: LessonSearchQueryState = {
  isPending: false,
  isError: false,
  data: { items: [], page: 1, pageSize: 50, total: 0 },
  error: null,
  refetch: () => {},
};

const meta: Meta<typeof LessonsSection> = {
  title: 'HomePage/LessonsSection',
  component: LessonsSection,
  args: { targetDate: TODAY, city, searchQuery: '' },
};

export default meta;
type Story = StoryObj<typeof LessonsSection>;

export const Loading: Story = {
  args: { query: pendingQuery },
};

export const Error: Story = {
  args: { query: errorQuery },
};

export const Populated: Story = {
  args: { query: populatedQuery },
};

export const EmptyWithNextDay: Story = {
  args: { query: emptyWithFallbackQuery },
};

export const EmptyTerminal: Story = {
  args: { query: terminalEmptyQuery },
};

// No city chosen: the honest first-load state, "all areas" rather than a
// guessed default (design-system.md, "No default city").
export const PopulatedAllAreas: Story = {
  args: { query: populatedQuery, city: undefined },
};

// A free-text search with real matches: the list renders exactly like the
// unfiltered case, since the server already narrowed `items`.
export const SearchResults: Story = {
  args: { query: populatedQuery, searchQuery: 'מזרחי' },
};

// A free-text search with nothing in the whole widened window: the
// headline and hint must name the search term, or a searcher reads the
// screen as if their search was silently ignored.
export const SearchNoResults: Story = {
  args: { query: terminalEmptyQuery, searchQuery: 'שם שלא קיים' },
};
