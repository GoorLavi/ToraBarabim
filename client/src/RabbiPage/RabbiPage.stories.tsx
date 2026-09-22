import type { LessonOccurrence, RabbiDetailResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver, queryOf, respondWithJson } from '../../.storybook/apiMocks';
import { RabbiPage } from './RabbiPage';

const rabbiDetail = (overrides: Partial<RabbiDetailResponse>): RabbiDetailResponse => ({
  ...rabbiFixture({
    id: 'story-rabbi',
    name: 'יעקב מזרחי',
    title: 'ראש ישיבה',
    photoUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="260" height="347"><rect width="260" height="347" fill="lightgray"/></svg>'),
    bio: 'ראש ישיבת "אור התורה" ומגידי השיעור הוותיקים בעיר. מלמד גמרא והלכה מזה למעלה מעשרים שנה.',
  }),
  lessonCount: 3,
  cities: [{ id: '4000', name: 'חיפה', slug: 'חיפה', area: 'haifa' }],
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
  rabbi: rabbiFixture({ id: 'story-rabbi', name: 'יעקב מזרחי' }),
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'חיפה', citySlug: 'חיפה', area: 'haifa' },
  ...overrides,
});

const rabbiHandler = (detail: RabbiDetailResponse) => http.get('/v1/rabbis/:rabbiId', jsonResolver(detail));

const populatedLessons: LessonOccurrence[] = [
  lesson({ lessonId: 'l1', date: '2026-09-10', startTime: '20:30' }),
  lesson({
    lessonId: 'l2',
    date: '2026-09-11',
    startTime: '06:00',
    title: undefined,
    topic: 'gemara',
    place: {
      name: 'בית מדרש אוהל יעקב, מרכז קהילתי נאות שקד',
      street: 'הרב קוק 12',
      city: 'חיפה',
      citySlug: 'חיפה',
      area: 'haifa',
    },
  }),
  lesson({ lessonId: 'l3', date: '2026-09-13', startTime: '19:00', audience: 'women' }),
];

// The nationwide fallback the page fetches for the empty-rabbi state: a
// lessons request with no `rabbiId`.
const nationwideLessons = {
  items: [
    lesson({ lessonId: 'n1', rabbi: rabbiFixture({ id: 'other-1', name: 'אברהם כהן' }) }),
    lesson({ lessonId: 'n2', rabbi: rabbiFixture({ id: 'other-2', name: 'משה לוי' }) }),
  ],
  page: 1,
  pageSize: 4,
  total: 2,
};

const lessonsHandler = (rabbiLessons: LessonOccurrence[]) =>
  http.get('/v1/lessons', ({ request }) =>
    respondWithJson(
      queryOf(request).has('rabbiId') ? { items: rabbiLessons, page: 1, pageSize: 20, total: rabbiLessons.length } : nationwideLessons,
    ),
  );

// The global Storybook decorator (.storybook/preview.tsx) already wraps
// every story in one MemoryRouter; a second, nested one throws ("You should
// never have more than one in your app"). `Routes` accepts a `location`
// override instead, matching a route without a second router or touching
// the shared preview file.
//
// The bare id, with no slug segment, is the location under test: it is the
// one the optional `:slug?` segment exists to still resolve, and the page
// only ever reads `rabbiId` off the params regardless.
const withRoute = (rabbiId: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/rabbis/${rabbiId}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/rabbis/:rabbiId/:slug?" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof RabbiPage> = {
  title: 'RabbiPage/RabbiPage',
  component: RabbiPage,
  parameters: { apiMocks: { handlers: { lessons: lessonsHandler([]) } } },
};

export default meta;
type Story = StoryObj<typeof RabbiPage>;

export const Populated: Story = {
  decorators: [withRoute('story-populated')],
  parameters: { apiMocks: { handlers: { rabbi: rabbiHandler(rabbiDetail({ id: 'story-populated' })), lessons: lessonsHandler(populatedLessons) } } },
};
export const NoPhoto: Story = {
  decorators: [withRoute('story-nophoto')],
  parameters: { apiMocks: { handlers: { rabbi: rabbiHandler(rabbiDetail({ id: 'story-nophoto', photoUrl: undefined, title: undefined })) } } },
};
export const VeryLongName: Story = {
  decorators: [withRoute('story-longname')],
  parameters: {
    apiMocks: {
      handlers: {
        rabbi: rabbiHandler(
          rabbiDetail({
            ...rabbiFixture({ id: 'story-longname', name: 'נתן צבי אשכנזי הכהן' }),
            cities: [
              { id: '1', name: 'חיפה', slug: 'חיפה', area: 'haifa' },
              { id: '2', name: 'ירושלים', slug: 'ירושלים', area: 'jerusalem' },
              { id: '3', name: 'תל אביב', slug: 'תל-אביב', area: 'telAviv' },
            ],
          }),
        ),
      },
    },
  },
};
export const EmptyWidenedToCountry: Story = {
  decorators: [withRoute('story-empty')],
  parameters: {
    apiMocks: {
      handlers: {
        rabbi: rabbiHandler(
          rabbiDetail({ ...rabbiFixture({ id: 'story-empty', name: 'שרה גולדברג', honorific: 'rabbanit' }), lessonCount: 0, cities: [] }),
        ),
      },
    },
  },
};
export const NotFound: Story = {
  decorators: [withRoute('story-notfound')],
  parameters: { apiMocks: { handlers: { rabbi: http.get('/v1/rabbis/:rabbiId', errorResolver(404, 'rabbi_not_found', 'לא נמצא')) } } },
};
export const ServerError: Story = {
  decorators: [withRoute('story-error')],
  parameters: { apiMocks: { handlers: { rabbi: http.get('/v1/rabbis/:rabbiId', errorResolver()) } } },
};
export const Loading: Story = {
  decorators: [withRoute('story-loading')],
  parameters: { apiMocks: { handlers: { rabbi: http.get('/v1/rabbis/:rabbiId', loadingResolver) } } },
};
