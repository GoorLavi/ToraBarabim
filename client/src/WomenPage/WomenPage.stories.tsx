import type { City, CityDetailResponse, LessonOccurrence, WomenAreaResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver, queryOf, respondWithJson } from '../../.storybook/apiMocks';
import { WomenPage } from './WomenPage';

const rabbanit = rabbiFixture({ id: 'story-rabbanit', name: 'שרה גולדברג', honorific: 'rabbanit' });
const rav = rabbiFixture({ id: 'story-rav', name: 'אברהם כהן' });

const lesson = (overrides: Partial<LessonOccurrence>): LessonOccurrence => ({
  lessonId: 'lesson-1',
  date: '2026-09-10',
  startTime: '20:30',
  endTime: '21:15',
  status: 'scheduled',
  title: 'שיעור באמונה',
  topic: 'machshava',
  audience: 'women',
  rabbi: rabbanit,
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'חיפה', citySlug: 'חיפה', area: 'haifa' },
  ...overrides,
});

const populatedSummary: WomenAreaResponse = {
  kind: 'populated',
  lessonCount: 2,
  teachers: [rabbanit, rav],
  cities: [
    { id: '4000', name: 'חיפה', slug: 'חיפה', area: 'haifa', lessonCount: 2 },
    { id: '5000', name: 'ירושלים', slug: 'ירושלים', area: 'jerusalem', lessonCount: 1 },
  ],
};

const emptySummary: WomenAreaResponse = { kind: 'empty', rabbaniyot: [rabbanit] };

const emptyLessons = { items: [], page: 1, pageSize: 24, total: 0 };

const womenHandler = (summary: WomenAreaResponse) => http.get('/v1/women', jsonResolver(summary));
const lessonsHandler = (items: LessonOccurrence[]) =>
  http.get('/v1/lessons', jsonResolver({ items, page: 1, pageSize: 24, total: items.length }));

const citiesHandler = (items: City[]) => http.get('/v1/cities', jsonResolver({ items }));

const unfilteredLessons: LessonOccurrence[] = [
  lesson({ lessonId: 'p1' }),
  lesson({ lessonId: 'p2', rabbi: rav, audience: 'mixed', date: '2026-09-11' }),
];

const cityLessons: LessonOccurrence[] = [
  lesson({ lessonId: 'l1', date: '2026-09-10', startTime: '20:30' }),
  lesson({ lessonId: 'l2', date: '2026-09-11', startTime: '19:00', rabbi: rav, audience: 'mixed' }),
];

const areaLessons: LessonOccurrence[] = [
  lesson({ lessonId: 'area1', date: '2026-09-12', place: { name: 'בית מדרש', street: 'הרצל 1', city: 'טבריה', citySlug: 'טבריה', area: 'north' } }),
];

// The global Storybook decorator (.storybook/preview.tsx) already wraps
// every story in one MemoryRouter; a second, nested one throws. `Routes`
// accepts a `location` override instead, matching CityPage.stories.tsx and
// RabbiPage.stories.tsx.
const withSearch = (search: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: '/women', search, hash: '', state: null, key: 'story' }}>
    <Route path="/women" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof WomenPage> = {
  title: 'WomenPage/WomenPage',
  component: WomenPage,
  parameters: { apiMocks: { handlers: { women: womenHandler(populatedSummary), cities: citiesHandler([]), lessons: lessonsHandler(unfilteredLessons) } } },
};

export default meta;
type Story = StoryObj<typeof WomenPage>;

export const Populated: Story = { decorators: [withSearch('')] };
export const PopulatedWithCity: Story = {
  decorators: [withSearch('?cityId=city-populated&cityName=חיפה')],
  parameters: { apiMocks: { handlers: { lessons: lessonsHandler(cityLessons) } } },
};
export const Loading: Story = {
  decorators: [withSearch('?cityId=story-loading&cityName=טוען')],
  parameters: { apiMocks: { handlers: { lessons: http.get('/v1/lessons', loadingResolver) } } },
};
export const ServerError: Story = {
  decorators: [withSearch('?cityId=story-error&cityName=שגיאה')],
  parameters: { apiMocks: { handlers: { lessons: http.get('/v1/lessons', errorResolver()) } } },
};
// The city has no lessons, so the page widens its own request to the city's
// area: the second lessons request carries `area` and no city.
export const EmptyWidenedToArea: Story = {
  decorators: [withSearch('?cityId=city-empty&cityName=עיר-ריקה')],
  parameters: {
    apiMocks: {
      handlers: {
        cities: citiesHandler([{ id: 'city-empty', name: 'עיר-ריקה', slug: 'עיר-ריקה', area: 'north' }]),
        cityDetail: http.get(
          '/v1/cities/:slug',
          jsonResolver({ id: 'city-empty', name: 'עיר-ריקה', slug: 'עיר-ריקה', area: 'north', areaName: 'הצפון', areaSlug: 'הצפון', rabbis: [] } satisfies CityDetailResponse),
        ),
        lessons: http.get('/v1/lessons', ({ request }) =>
          respondWithJson(queryOf(request).has('area') ? { items: areaLessons, page: 1, pageSize: 24, total: 1 } : emptyLessons),
        ),
      },
    },
  },
};
export const EmptyFilteredBySearch: Story = {
  decorators: [withSearch('?q=שיעור-שלא-קיים')],
  parameters: { apiMocks: { handlers: { lessons: lessonsHandler([]) } } },
};
export const EmptyFilteredByDate: Story = {
  decorators: [withSearch('?when=tomorrow')],
  parameters: { apiMocks: { handlers: { lessons: lessonsHandler([]) } } },
};
export const EmptyFilteredBySearchAndDate: Story = {
  decorators: [withSearch('?q=שיעור-שלא-קיים&when=tomorrow')],
  parameters: { apiMocks: { handlers: { lessons: lessonsHandler([]) } } },
};
export const EmptyNothingYet: Story = {
  decorators: [withSearch('')],
  parameters: { apiMocks: { handlers: { women: womenHandler(emptySummary), lessons: lessonsHandler([]) } } },
};
