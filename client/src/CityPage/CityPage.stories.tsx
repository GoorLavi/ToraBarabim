import type { CityDetailResponse, LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver, queryOf, respondWithJson } from '../../.storybook/apiMocks';
import { CityPage } from './CityPage';

const cityDetail = (overrides: Partial<CityDetailResponse>): CityDetailResponse => ({
  id: '4000',
  name: 'חיפה',
  slug: 'חיפה',
  area: 'haifa',
  areaName: 'חיפה והקריות',
  areaSlug: 'חיפה-והקריות',
  rabbis: [
    rabbiFixture({ id: 'r1', name: 'אברהם כהן', title: 'ראש ישיבה', photoUrl: 'https://example.invalid/r1.jpg' }),
    rabbiFixture({ id: 'r2', name: 'משה לוי' }),
    rabbiFixture({ id: 'r3', name: 'נתן צבי אשכנזי הכהן', photoUrl: 'https://example.invalid/r3.jpg' }),
  ],
  ...overrides,
});

const lesson = (overrides: Partial<LessonOccurrence>): LessonOccurrence => ({
  lessonId: 'lesson-1',
  date: '2026-09-10',
  startTime: '20:30',
  endTime: '21:15',
  status: 'scheduled',
  title: 'עיונים בפרשת השבוע',
  topic: 'parasha',
  audience: 'mixed',
  rabbi: rabbiFixture({ id: 'r1', name: 'אברהם כהן' }),
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'חיפה', citySlug: 'חיפה', area: 'haifa' },
  ...overrides,
});

const emptyLessons = { items: [], page: 1, pageSize: 24, total: 0 };

const cityHandler = (detail: CityDetailResponse) => http.get('/v1/cities/:slug', jsonResolver(detail));
const lessonsHandler = (items: LessonOccurrence[]) =>
  http.get('/v1/lessons', jsonResolver({ items, page: 1, pageSize: 24, total: items.length }));

const populatedLessons: LessonOccurrence[] = [
  lesson({ lessonId: 'l1', date: '2026-09-10', startTime: '20:30' }),
  lesson({ lessonId: 'l2', date: '2026-09-10', startTime: '06:00', rabbi: rabbiFixture({ id: 'r2', name: 'משה לוי' }) }),
  lesson({ lessonId: 'l3', date: '2026-09-13', startTime: '19:00', audience: 'women', title: undefined, topic: undefined }),
];

const areaLessons: LessonOccurrence[] = [
  lesson({
    lessonId: 'a1',
    rabbi: rabbiFixture({ id: 'r9', name: 'שמעון אזולאי' }),
    place: { name: 'בית מדרש', street: 'הרצל 1', city: 'טבריה', citySlug: 'טבריה', area: 'north' },
  }),
];

const emptyCityDetail = cityDetail({
  id: '46',
  name: 'עיר-ריקה',
  slug: 'עיר-ריקה',
  area: 'north',
  areaName: 'הצפון',
  areaSlug: 'הצפון',
  rabbis: [],
});

// See RabbiPage.stories.tsx for why this uses `Routes`'s `location` override
// instead of a second, nested MemoryRouter.
const withRoute = (citySlug: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/cities/${encodeURIComponent(citySlug)}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/cities/:slug" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof CityPage> = {
  title: 'CityPage/CityPage',
  component: CityPage,
  parameters: { apiMocks: { handlers: { lessons: lessonsHandler([]) } } },
};

export default meta;
type Story = StoryObj<typeof CityPage>;

export const Populated: Story = {
  decorators: [withRoute('עיר-מלאה')],
  parameters: { apiMocks: { handlers: { city: cityHandler(cityDetail({ name: 'עיר-מלאה', slug: 'עיר-מלאה' })), lessons: lessonsHandler(populatedLessons) } } },
};
// The city has no lessons, so the page widens its own request to the whole area.
export const EmptyWidenedToArea: Story = {
  decorators: [withRoute('עיר-ריקה')],
  parameters: {
    apiMocks: {
      handlers: {
        city: cityHandler(emptyCityDetail),
        lessons: http.get('/v1/lessons', ({ request }) =>
          respondWithJson(queryOf(request).has('area') ? { items: areaLessons, page: 1, pageSize: 24, total: 1 } : emptyLessons),
        ),
      },
    },
  },
};
export const NotFound: Story = {
  decorators: [withRoute('שם-עיר-לא-קיים')],
  parameters: { apiMocks: { handlers: { city: http.get('/v1/cities/:slug', errorResolver(404, 'city_not_found', 'לא נמצאה')) } } },
};
export const ServerError: Story = {
  decorators: [withRoute('עיר-שגיאה')],
  parameters: { apiMocks: { handlers: { city: http.get('/v1/cities/:slug', errorResolver()) } } },
};
export const Loading: Story = {
  decorators: [withRoute('עיר-טעינה')],
  parameters: { apiMocks: { handlers: { city: http.get('/v1/cities/:slug', loadingResolver) } } },
};
