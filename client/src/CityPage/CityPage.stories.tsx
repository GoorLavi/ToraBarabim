import type { CityDetailResponse, LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { CityPage } from './CityPage';

// No live API in Storybook's own preview server: see RabbiPage.stories.tsx
// for why every route this page calls is answered here instead.
const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const NEVER_RESOLVES = new Promise<Response>(() => {});

const installMockFetch = (respond: (url: URL) => Response | Promise<Response> | null): void => {
  const previousFetch = window.fetch;
  window.fetch = (async (input, init) => {
    const url = input instanceof Request ? new URL(input.url) : new URL(input.toString(), window.location.origin);
    const result = respond(url);
    if (result) return result;
    return previousFetch(input, init);
  }) as typeof fetch;
};

const cityDetail = (overrides: Partial<CityDetailResponse>): CityDetailResponse => ({
  id: '4000',
  name: 'חיפה',
  area: 'haifa',
  areaName: 'חיפה והקריות',
  rabbis: [
    { id: 'r1', name: 'הרב אברהם כהן', title: 'ראש ישיבה', photoUrl: 'https://example.invalid/r1.jpg' },
    { id: 'r2', name: 'הרב משה לוי' },
    { id: 'r3', name: 'הרב נתן צבי אשכנזי הכהן', photoUrl: 'https://example.invalid/r3.jpg' },
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
  rabbi: { id: 'r1', name: 'הרב אברהם כהן' },
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'חיפה', area: 'haifa' },
  ...overrides,
});

installMockFetch((url) => {
  // `URL#pathname` is always percent-encoded, even for a plain assignment
  // like `new URL('/v1/cities/עיר')`: comparing it against a literal Hebrew
  // string never matches, which is exactly the 404 this looked like before
  // decoding it back.
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/v1/cities/עיר-מלאה') return jsonResponse(200, cityDetail({ name: 'עיר-מלאה' }));
  if (pathname === '/v1/cities/עיר-ריקה') {
    return jsonResponse(200, cityDetail({ id: '46', name: 'עיר-ריקה', area: 'north', areaName: 'הצפון', rabbis: [] }));
  }
  if (pathname === '/v1/cities/שם-עיר-לא-קיים') return jsonResponse(404, { error: 'city_not_found', message: 'לא נמצאה' });
  if (pathname === '/v1/cities/עיר-שגיאה') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (pathname === '/v1/cities/עיר-טעינה') return NEVER_RESOLVES;

  if (pathname === '/v1/lessons') {
    if (url.searchParams.get('city') === '4000') {
      return jsonResponse(200, {
        items: [
          lesson({ lessonId: 'l1', date: '2026-09-10', startTime: '20:30' }),
          lesson({ lessonId: 'l2', date: '2026-09-10', startTime: '06:00', rabbi: { id: 'r2', name: 'הרב משה לוי' } }),
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
        items: [lesson({ lessonId: 'a1', rabbi: { id: 'r9', name: 'הרב שמעון אזולאי' }, place: { name: 'בית מדרש', street: 'הרצל 1', city: 'טבריה', area: 'north' } })],
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
const withRoute = (cityName: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/cities/${encodeURIComponent(cityName)}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/cities/:cityName" element={<Story />} />
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
