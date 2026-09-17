import type { LessonOccurrence, WomenAreaResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { resolveTargetDate } from '~/HomePage/helpers';
import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

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

const tomorrow = resolveTargetDate('tomorrow', undefined);

// `GET /v1/women` takes no query parameters at all (api.ts), so the mock
// cannot tell two stories apart by the request the way every other handler
// below does. Each story's decorator sets this before the page mounts
// instead (render runs before the query's own effect fires).
let summaryScenario: 'populated' | 'empty' = 'populated';

installMockFetch((url) => {
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/v1/women') {
    return jsonResponse(200, summaryScenario === 'empty' ? emptySummary : populatedSummary);
  }

  if (pathname === '/v1/cities') {
    if (url.searchParams.get('q') === 'עיר-ריקה') {
      return jsonResponse(200, { items: [{ id: 'city-empty', name: 'עיר-ריקה', slug: 'עיר-ריקה', area: 'north' }] });
    }
    return jsonResponse(200, { items: [] });
  }

  if (pathname === '/v1/lessons') {
    const scope = url.searchParams.get('scope');
    if (scope !== 'women') return null;

    const cityId = url.searchParams.get('city');
    const area = url.searchParams.get('area');
    const q = url.searchParams.get('q');
    const from = url.searchParams.get('from');

    if (cityId === 'story-loading') return NEVER_RESOLVES;
    if (cityId === 'story-error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });

    if (cityId === 'city-populated') {
      return jsonResponse(200, {
        items: [
          lesson({ lessonId: 'l1', date: '2026-09-10', startTime: '20:30' }),
          lesson({ lessonId: 'l2', date: '2026-09-11', startTime: '19:00', rabbi: rav, audience: 'mixed' }),
        ],
        page: 1,
        pageSize: 24,
        total: 2,
      });
    }

    // The area-widen fallback fetch: no city, no date, just the area.
    if (area === 'north') {
      if (url.searchParams.get('pageSize') === '24' && !q) {
        return jsonResponse(200, {
          items: [lesson({ lessonId: 'area1', date: '2026-09-12', place: { name: 'בית מדרש', street: 'הרצל 1', city: 'טבריה', citySlug: 'טבריה', area: 'north' } })],
          page: 1,
          pageSize: 24,
          total: 1,
        });
      }
    }

    if (cityId === 'city-empty') return jsonResponse(200, { items: [], page: 1, pageSize: 24, total: 0 });

    // A search term or a date chip with no city: everything else empty.
    if (q || (from && from === tomorrow)) return jsonResponse(200, { items: [], page: 1, pageSize: 24, total: 0 });

    if (cityId === null && q === null) {
      // Either the true unfiltered populated state or the empty-with-nothing
      // state, told apart the same way the `/v1/women` handler above is.
      if (summaryScenario === 'empty') return jsonResponse(200, { items: [], page: 1, pageSize: 24, total: 0 });
      return jsonResponse(200, {
        items: [lesson({ lessonId: 'p1' }), lesson({ lessonId: 'p2', rabbi: rav, audience: 'mixed', date: '2026-09-11' })],
        page: 1,
        pageSize: 24,
        total: 2,
      });
    }

    return jsonResponse(200, { items: [], page: 1, pageSize: 24, total: 0 });
  }

  return null;
});

// The global Storybook decorator (.storybook/preview.tsx) already wraps
// every story in one MemoryRouter; a second, nested one throws. `Routes`
// accepts a `location` override instead, matching CityPage.stories.tsx and
// RabbiPage.stories.tsx.
const withSearch = (search: string, scenario: 'populated' | 'empty' = 'populated') => (Story: React.ComponentType) => {
  summaryScenario = scenario;
  return (
    <Routes location={{ pathname: '/women', search, hash: '', state: null, key: 'story' }}>
      <Route path="/women" element={<Story />} />
    </Routes>
  );
};

const meta: Meta<typeof WomenPage> = {
  title: 'WomenPage/WomenPage',
  component: WomenPage,
};

export default meta;
type Story = StoryObj<typeof WomenPage>;

export const Populated: Story = { decorators: [withSearch('')] };
export const PopulatedWithCity: Story = { decorators: [withSearch('?cityId=city-populated&cityName=חיפה')] };
export const Loading: Story = { decorators: [withSearch('?cityId=story-loading&cityName=טוען')] };
export const ServerError: Story = { decorators: [withSearch('?cityId=story-error&cityName=שגיאה')] };
export const EmptyWidenedToArea: Story = { decorators: [withSearch('?cityId=city-empty&cityName=עיר-ריקה')] };
export const EmptyFilteredBySearch: Story = { decorators: [withSearch('?q=שיעור-שלא-קיים')] };
export const EmptyFilteredByDate: Story = { decorators: [withSearch('?when=tomorrow')] };
export const EmptyFilteredBySearchAndDate: Story = { decorators: [withSearch('?q=שיעור-שלא-קיים&when=tomorrow')] };
export const EmptyNothingYet: Story = { decorators: [withSearch('', 'empty')] };
