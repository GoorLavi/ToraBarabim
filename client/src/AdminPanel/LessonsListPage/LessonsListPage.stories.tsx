import type { LessonResponse, RabbiResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../../.storybook/apiMocks';
import { LessonsListPage } from './LessonsListPage';

const rabbiResponse = (overrides: Partial<RabbiResponse>): RabbiResponse => ({
  ...rabbiFixture({ id: 'rabbi-1', name: 'אברהם כהן' }),
  prominence: 'known',
  ...overrides,
});

const rabbisList: RabbiResponse[] = [
  rabbiResponse({ id: 'rabbi-1', name: 'אברהם כהן' }),
  rabbiResponse({ id: 'rabbi-2', name: 'משה לוי' }),
  rabbiResponse({ id: 'rabbi-3', name: 'נתן צבי אשכנזי הכהן' }),
];

const lesson = (overrides: Partial<LessonResponse>): LessonResponse => ({
  id: 'l1',
  title: 'עיונים בפרשת השבוע',
  rabbiId: 'rabbi-1',
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', cityCode: 4000, cityName: 'חיפה' },
  topic: 'parasha',
  audience: 'mixed',
  recurrence: { kind: 'weekly', weekdays: [2] },
  startTime: '20:30',
  durationMinutes: 60,
  provenance: 'manual',
  ...overrides,
});

const populatedLessons: LessonResponse[] = [
  lesson({ id: 'l1' }),
  lesson({
    id: 'l2',
    title: 'שיעור דף יומי',
    rabbiId: 'rabbi-2',
    topic: 'gemara',
    audience: 'men',
    recurrence: { kind: 'weekly', weekdays: [0, 1, 2, 3, 4] },
    startTime: '06:00',
    place: { name: 'בית מדרש הרב קוק', street: 'הרצל 8', cityCode: 5000, cityName: 'ירושלים' },
  }),
  lesson({
    id: 'l3',
    title: undefined,
    topic: undefined,
    rabbiId: 'rabbi-3',
    audience: 'women',
    recurrence: { kind: 'once', date: '2026-10-15' },
    startTime: '19:30',
    place: { name: 'אולם קהילתי', street: 'רחוב בן גוריון 3', cityCode: 5000, cityName: 'ירושלים' },
  }),
];

const rabbi1Lessons: LessonResponse[] = [
  lesson({ id: 'r1-a', rabbiId: 'rabbi-1' }),
  lesson({ id: 'r1-b', rabbiId: 'rabbi-1', title: 'שיעור הלכה יומי', startTime: '07:00', recurrence: { kind: 'weekly', weekdays: [0, 1, 2, 3, 4] } }),
];

const rabbisHandler = http.get('/v1/admin/rabbis', jsonResolver({ items: rabbisList, page: 1, pageSize: 50, total: rabbisList.length }));
const lessonsHandler = (items: LessonResponse[]) =>
  http.get('/v1/admin/lessons', jsonResolver({ items, page: 1, pageSize: 50, total: items.length }));

// See RabbiPage.stories.tsx for why this uses `Routes`'s `location` override
// instead of a second, nested MemoryRouter.
const withSearch = (search: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: '/admin/lessons', search, hash: '', state: null, key: 'story' }}>
    <Route path="/admin/lessons" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof LessonsListPage> = {
  title: 'AdminPanel/LessonsListPage',
  component: LessonsListPage,
  parameters: { apiMocks: { handlers: { rabbis: rabbisHandler, lessons: lessonsHandler(populatedLessons) } } },
};

export default meta;
type Story = StoryObj<typeof LessonsListPage>;

export const Populated: Story = { decorators: [withSearch('')] };

// The filter chip, sitting next to city/recurrence/search rather than
// stretching full width, is what this state exists to show.
export const RabbiFiltered: Story = {
  decorators: [withSearch('?rabbiId=rabbi-1&rabbiName=' + encodeURIComponent('אברהם כהן') + '&rabbiHonorific=rav')],
  parameters: { apiMocks: { handlers: { lessons: lessonsHandler(rabbi1Lessons) } } },
};

export const RabbiFilteredZeroResults: Story = {
  decorators: [withSearch('?rabbiId=rabbi-no-lessons&rabbiName=' + encodeURIComponent('דוד פרץ') + '&rabbiHonorific=rav')],
  parameters: { apiMocks: { handlers: { lessons: lessonsHandler([]) } } },
};

export const CityFilterNoMatches: Story = {
  decorators: [withSearch('?cityId=city-no-matches&cityName=' + encodeURIComponent('דימונה'))],
  parameters: { apiMocks: { handlers: { lessons: lessonsHandler([]) } } },
};

export const SystemEmpty: Story = { decorators: [withSearch('')], parameters: { apiMocks: { handlers: { lessons: lessonsHandler([]) } } } };
export const Loading: Story = { decorators: [withSearch('')], parameters: { apiMocks: { handlers: { lessons: http.get('/v1/admin/lessons', loadingResolver) } } } };
export const ServerError: Story = { decorators: [withSearch('')], parameters: { apiMocks: { handlers: { lessons: http.get('/v1/admin/lessons', errorResolver()) } } } };
