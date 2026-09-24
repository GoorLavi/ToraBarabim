import type { LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../.storybook/apiMocks';
import { LessonsPage } from './LessonsPage';

const lesson = (overrides: Partial<LessonOccurrence>): LessonOccurrence => ({
  lessonId: 'lesson-1',
  date: '2026-09-22',
  startTime: '20:00',
  endTime: '21:00',
  status: 'scheduled',
  title: 'הלכות שבת',
  topic: 'halacha',
  audience: 'men',
  rabbi: rabbiFixture({ id: 'r1', name: 'אליהו בן דוד' }),
  venue: { kind: 'address', name: 'בית הכנסת הגדול', street: 'שדרות הנשיא 12', city: 'חיפה', citySlug: 'חיפה', area: 'haifa' },
  ...overrides,
});

const lessonsHandler = (items: LessonOccurrence[], total = items.length) =>
  http.get('/v1/lessons', jsonResolver({ items, page: 1, pageSize: 20, total }));

const populatedLessons: LessonOccurrence[] = [
  lesson({ lessonId: 'l1', date: '2026-09-22', startTime: '20:00' }),
  lesson({
    lessonId: 'l2',
    date: '2026-09-23',
    startTime: '06:30',
    rabbi: rabbiFixture({ id: 'r2', name: 'שמואל וקנין' }),
    title: 'שיעור דף יומי',
    topic: 'gemara',
  }),
  lesson({
    lessonId: 'l3',
    date: '2026-09-25',
    startTime: '19:30',
    audience: 'women',
    title: undefined,
    topic: undefined,
    venue: { kind: 'address', name: 'אולם קהילתי', street: 'רחוב הרצל 8', city: 'קריית ביאליק', citySlug: 'קריית-ביאליק', area: 'haifa' },
  }),
];

const meta: Meta<typeof LessonsPage> = {
  title: 'LessonsPage/LessonsPage',
  component: LessonsPage,
};

export default meta;
type Story = StoryObj<typeof LessonsPage>;

export const Populated: Story = {
  parameters: { apiMocks: { handlers: { lessons: lessonsHandler(populatedLessons) } } },
};
export const Empty: Story = {
  parameters: { apiMocks: { handlers: { lessons: lessonsHandler([]) } } },
};
export const ServerError: Story = {
  parameters: { apiMocks: { handlers: { lessons: http.get('/v1/lessons', errorResolver()) } } },
};
export const Loading: Story = {
  parameters: { apiMocks: { handlers: { lessons: http.get('/v1/lessons', loadingResolver) } } },
};
