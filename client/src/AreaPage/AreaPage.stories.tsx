import type { AreaDetailResponse, AreaDirectoryResponse, LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';

import { AreaPage } from './AreaPage';

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

const areaDetail = (overrides: Partial<AreaDetailResponse>): AreaDetailResponse => ({
  area: 'haifa',
  areaName: 'חיפה והקריות',
  slug: 'חיפה-והקריות',
  cities: [
    { id: '4000', name: 'חיפה', slug: 'חיפה', area: 'haifa', lessonCount: 6 },
    { id: '4020', name: 'קריית ביאליק', slug: 'קריית-ביאליק', area: 'haifa', lessonCount: 2 },
    { id: '4030', name: 'קריית מוצקין', slug: 'קריית-מוצקין', area: 'haifa', lessonCount: 1 },
  ],
  ...overrides,
});

const lesson = (overrides: Partial<LessonOccurrence>): LessonOccurrence => ({
  lessonId: 'lesson-1',
  date: '2026-09-14',
  startTime: '20:00',
  endTime: '21:00',
  status: 'scheduled',
  title: 'הלכות שבת',
  topic: 'halacha',
  audience: 'men',
  rabbi: rabbiFixture({ id: 'r1', name: 'אליהו בן דוד' }),
  place: { name: 'בית הכנסת הגדול', street: 'שדרות הנשיא 12', city: 'חיפה', citySlug: 'חיפה', area: 'haifa' },
  ...overrides,
});

const areaDirectory = (overrides: Partial<AreaDirectoryResponse>): AreaDirectoryResponse => ({
  areas: [
    { area: 'north', areaName: 'הצפון', slug: 'הצפון', cityCount: 4, lessonCount: 9 },
    { area: 'sharon', areaName: 'השרון', slug: 'השרון', cityCount: 3, lessonCount: 5 },
  ],
  ...overrides,
});

installMockFetch((url) => {
  // `URL#pathname` is always percent-encoded, even for a plain assignment
  // like `new URL('/v1/areas/עיר')`: comparing it against a literal Hebrew
  // string never matches, which is exactly the 404 this looked like before
  // decoding it back (mirrors CityPage.stories.tsx).
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/v1/areas/חיפה-והקריות') return jsonResponse(200, areaDetail({}));
  if (pathname === '/v1/areas/השרון') {
    return jsonResponse(
      200,
      areaDetail({
        area: 'sharon',
        areaName: 'השרון',
        slug: 'השרון',
        cities: [
          { id: '4200', name: 'רעננה', slug: 'רעננה', area: 'sharon', lessonCount: 3 },
          { id: '4210', name: 'כפר סבא', slug: 'כפר-סבא', area: 'sharon', lessonCount: 2 },
          { id: '4220', name: 'הוד השרון', slug: 'הוד-השרון', area: 'sharon', lessonCount: 1 },
        ],
      }),
    );
  }
  if (pathname === '/v1/areas/הדרום') {
    return jsonResponse(200, areaDetail({ area: 'south', areaName: 'הדרום', slug: 'הדרום', cities: [] }));
  }
  if (pathname === '/v1/areas/אזור-שלא-קיים') return jsonResponse(404, { error: 'area_not_found', message: 'האזור המבוקש לא נמצא' });
  if (pathname === '/v1/areas/אזור-שגיאה') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (pathname === '/v1/areas/אזור-בטעינה') return NEVER_RESOLVES;

  if (pathname === '/v1/lessons') {
    if (url.searchParams.get('area') === 'haifa') {
      return jsonResponse(200, {
        items: [
          lesson({ lessonId: 'l1', date: '2026-09-14', startTime: '20:00' }),
          lesson({
            lessonId: 'l2',
            date: '2026-09-14',
            startTime: '06:30',
            rabbi: rabbiFixture({ id: 'r2', name: 'שמואל וקנין' }),
            title: 'שיעור דף יומי',
            topic: 'gemara',
          }),
          lesson({
            lessonId: 'l3',
            date: '2026-09-17',
            startTime: '19:30',
            audience: 'women',
            title: undefined,
            topic: undefined,
            place: { name: 'אולם קהילתי', street: 'רחוב הרצל 8', city: 'קריית ביאליק', citySlug: 'קריית-ביאליק', area: 'haifa' },
          }),
        ],
        page: 1,
        pageSize: 24,
        total: 5,
      });
    }
    if (url.searchParams.get('area') === 'sharon') {
      return jsonResponse(200, { items: [], page: 1, pageSize: 24, total: 0 });
    }
    // Falls through for every other lessons query rather than answering it.
    // Each stories file wraps `window.fetch` and keeps the previous wrapper,
    // so returning a response here stops the chain: a catch-all would swallow
    // CityPage's and RabbiPage's own lessons mocks depending on which module
    // Storybook happened to load first.
    return null;
  }

  if (pathname === '/v1/areas') return jsonResponse(200, areaDirectory({}));

  return null;
});

// See RabbiPage.stories.tsx for why this uses `Routes`'s `location` override
// instead of a second, nested MemoryRouter.
const withRoute = (areaSlug: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/areas/${encodeURIComponent(areaSlug)}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/areas/:slug" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof AreaPage> = {
  title: 'AreaPage/AreaPage',
  component: AreaPage,
};

export default meta;
type Story = StoryObj<typeof AreaPage>;

export const Populated: Story = { decorators: [withRoute('חיפה-והקריות')] };
export const CitiesButWindowEmpty: Story = { decorators: [withRoute('השרון')] };
export const AreaGenuinelyEmpty: Story = { decorators: [withRoute('הדרום')] };
export const NotFound: Story = { decorators: [withRoute('אזור-שלא-קיים')] };
export const ServerError: Story = { decorators: [withRoute('אזור-שגיאה')] };
export const Loading: Story = { decorators: [withRoute('אזור-בטעינה')] };
