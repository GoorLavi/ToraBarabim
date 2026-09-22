import type { CityDetailResponse, LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

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
  venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'חיפה', citySlug: 'חיפה', area: 'haifa' },
  ...overrides,
});

installMockFetch((url) => {
  // `URL#pathname` is always percent-encoded, even for a plain assignment
  // like `new URL('/v1/cities/עיר')`: comparing it against a literal Hebrew
  // string never matches, which is exactly the 404 this looked like before
  // decoding it back.
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/v1/cities/עיר-מלאה') return jsonResponse(200, cityDetail({ name: 'עיר-מלאה', slug: 'עיר-מלאה' }));
  if (pathname === '/v1/cities/עיר-ריקה') {
    return jsonResponse(
      200,
      cityDetail({
        id: '46',
        name: 'עיר-ריקה',
        slug: 'עיר-ריקה',
        area: 'north',
        areaName: 'הצפון',
        areaSlug: 'הצפון',
        rabbis: [],
      }),
    );
  }
  if (pathname === '/v1/cities/שם-עיר-לא-קיים') return jsonResponse(404, { error: 'city_not_found', message: 'לא נמצאה' });
  if (pathname === '/v1/cities/עיר-שגיאה') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (pathname === '/v1/cities/עיר-טעינה') return NEVER_RESOLVES;

  if (pathname === '/v1/lessons') {
    if (url.searchParams.get('city') === '4000') {
      return jsonResponse(200, {
        items: [
          lesson({ lessonId: 'l1', date: '2026-09-10', startTime: '20:30' }),
          lesson({ lessonId: 'l2', date: '2026-09-10', startTime: '06:00', rabbi: rabbiFixture({ id: 'r2', name: 'משה לוי' }) }),
          lesson({ lessonId: 'l3', date: '2026-09-13', startTime: '19:00', audience: 'women', title: undefined, topic: undefined }),
        ],
        page: 1,
        pageSize: 24,
        total: 3,
      });
    }
    if (url.searchParams.get('city') === '46') {
      return jsonResponse(200, { items: [], page: 1, pageSize: 24, total: 0 });
    }
    if (url.searchParams.get('area') === 'north') {
      return jsonResponse(200, {
        items: [
          lesson({
            lessonId: 'a1',
            rabbi: rabbiFixture({ id: 'r9', name: 'שמעון אזולאי' }),
            venue: { kind: 'address', name: 'בית מדרש', street: 'הרצל 1', city: 'טבריה', citySlug: 'טבריה', area: 'north' },
          }),
        ],
        page: 1,
        pageSize: 24,
        total: 1,
      });
    }
    return jsonResponse(200, { items: [], page: 1, pageSize: 24, total: 0 });
  }

  return null;
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
};

export default meta;
type Story = StoryObj<typeof CityPage>;

export const Populated: Story = { decorators: [withRoute('עיר-מלאה')] };
export const EmptyWidenedToArea: Story = { decorators: [withRoute('עיר-ריקה')] };
export const NotFound: Story = { decorators: [withRoute('שם-עיר-לא-קיים')] };
export const ServerError: Story = { decorators: [withRoute('עיר-שגיאה')] };
export const Loading: Story = { decorators: [withRoute('עיר-טעינה')] };
