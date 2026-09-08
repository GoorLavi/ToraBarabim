import type { LessonOccurrence, RabbiDetailResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { RabbiPage } from './RabbiPage';

// No live API in Storybook's own preview server (unlike the app itself,
// which vite.config.ts proxies to the real API in dev): every route this
// page calls is answered here instead. Chains onto whatever `window.fetch`
// already is, so this and CityPage.stories.tsx can both install a mock in
// either load order without clobbering each other.
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

const rabbiDetail = (overrides: Partial<RabbiDetailResponse>): RabbiDetailResponse => ({
  id: 'story-rabbi',
  name: 'הרב יעקב מזרחי',
  title: 'ראש ישיבה',
  photoUrl:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="260" height="347"><rect width="260" height="347" fill="lightgray"/></svg>'),
  bio: 'ראש ישיבת "אור התורה" ומגידי השיעור הוותיקים בעיר. מלמד גמרא והלכה מזה למעלה מעשרים שנה.',
  lessonCount: 3,
  cities: [{ id: '4000', name: 'חיפה', area: 'haifa' }],
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
  rabbi: { id: 'story-rabbi', name: 'הרב יעקב מזרחי' },
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'חיפה', area: 'haifa' },
  ...overrides,
});

installMockFetch((url) => {
  if (url.pathname === '/v1/rabbis/story-populated') return jsonResponse(200, rabbiDetail({ id: 'story-populated' }));
  if (url.pathname === '/v1/rabbis/story-nophoto') {
    return jsonResponse(200, rabbiDetail({ id: 'story-nophoto', photoUrl: undefined, title: undefined }));
  }
  if (url.pathname === '/v1/rabbis/story-longname') {
    return jsonResponse(
      200,
      rabbiDetail({
        id: 'story-longname',
        name: 'הרב נתן צבי אשכנזי הכהן',
        cities: [
          { id: '1', name: 'חיפה', area: 'haifa' },
          { id: '2', name: 'ירושלים', area: 'jerusalem' },
          { id: '3', name: 'תל אביב', area: 'telAviv' },
        ],
      }),
    );
  }
  if (url.pathname === '/v1/rabbis/story-empty') {
    return jsonResponse(200, rabbiDetail({ id: 'story-empty', name: 'הרבנית שרה גולדברג', lessonCount: 0, cities: [] }));
  }
  if (url.pathname === '/v1/rabbis/story-notfound') return jsonResponse(404, { error: 'rabbi_not_found', message: 'לא נמצא' });
  if (url.pathname === '/v1/rabbis/story-error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (url.pathname === '/v1/rabbis/story-loading') return NEVER_RESOLVES;

  if (url.pathname === '/v1/lessons') {
    if (url.searchParams.get('rabbiId') === 'story-populated') {
      return jsonResponse(200, {
        items: [
          lesson({ lessonId: 'l1', date: '2026-09-10', startTime: '20:30' }),
          lesson({
            lessonId: 'l2',
            date: '2026-09-11',
            startTime: '06:00',
            title: undefined,
            topic: 'gemara',
            place: { name: 'בית מדרש אוהל יעקב, מרכז קהילתי נאות שקד', street: 'הרב קוק 12', city: 'חיפה', area: 'haifa' },
          }),
          lesson({ lessonId: 'l3', date: '2026-09-13', startTime: '19:00', audience: 'women' }),
        ],
        page: 1,
        pageSize: 20,
        total: 3,
      });
    }
    if (!url.searchParams.get('rabbiId')) {
      // The nationwide fallback for the empty-rabbi state.
      return jsonResponse(200, {
        items: [
          lesson({ lessonId: 'n1', rabbi: { id: 'other-1', name: 'הרב אברהם כהן' } }),
          lesson({ lessonId: 'n2', rabbi: { id: 'other-2', name: 'הרב משה לוי' } }),
        ],
        page: 1,
        pageSize: 4,
        total: 2,
      });
    }
    return jsonResponse(200, { items: [], page: 1, pageSize: 20, total: 0 });
  }

  return null;
});

// The global Storybook decorator (.storybook/preview.tsx) already wraps
// every story in one MemoryRouter; a second, nested one throws ("You should
// never have more than one in your app"). `Routes` accepts a `location`
// override instead, matching a route without a second router or touching
// the shared preview file.
const withRoute = (rabbiId: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/rabbis/${rabbiId}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/rabbis/:rabbiId" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof RabbiPage> = {
  title: 'RabbiPage/RabbiPage',
  component: RabbiPage,
};

export default meta;
type Story = StoryObj<typeof RabbiPage>;

export const Populated: Story = { decorators: [withRoute('story-populated')] };
export const NoPhoto: Story = { decorators: [withRoute('story-nophoto')] };
export const VeryLongName: Story = { decorators: [withRoute('story-longname')] };
export const EmptyWidenedToCountry: Story = { decorators: [withRoute('story-empty')] };
export const NotFound: Story = { decorators: [withRoute('story-notfound')] };
export const ServerError: Story = { decorators: [withRoute('story-error')] };
export const Loading: Story = { decorators: [withRoute('story-loading')] };
