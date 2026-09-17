import type { LessonResponse, RabbiResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { LessonsListPage } from './LessonsListPage';

const rabbiResponse = (overrides: Partial<RabbiResponse>): RabbiResponse => ({
  ...rabbiFixture({ id: 'rabbi-1', name: 'אברהם כהן' }),
  prominence: 'known',
  ...overrides,
});

// Also carries `LessonFormPage.stories.tsx`'s edited rabbi (`story-edit-
// rabbi`): that file's `RabbiPicker` search hits this exact same unfiltered
// `/v1/admin/rabbis?page=1&pageSize=50` request, and whichever file's mock
// last loaded answers both (see that file's own comment on this).
const rabbisList: RabbiResponse[] = [
  rabbiResponse({ id: 'rabbi-1', name: 'אברהם כהן' }),
  rabbiResponse({ id: 'rabbi-2', name: 'משה לוי' }),
  rabbiResponse({ id: 'rabbi-3', name: 'נתן צבי אשכנזי הכהן' }),
  rabbiResponse({ id: 'story-edit-rabbi', name: 'יעקב מזרחי', title: 'ראש ישיבה' }),
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

// `GET /v1/admin/lessons` takes no parameter that tells "populated" and
// "system genuinely empty" apart (both are the unfiltered request), so each
// story's own decorator sets this before mounting, mirroring
// `WomenPage.stories.tsx`'s `summaryScenario`.
type UnfilteredScenario = 'populated' | 'empty' | 'loading' | 'error';
let unfilteredScenario: UnfilteredScenario = 'populated';

installMockFetch((url) => {
  if (url.pathname === '/v1/admin/rabbis') return jsonResponse(200, { items: rabbisList, page: 1, pageSize: 50, total: rabbisList.length });

  if (url.pathname !== '/v1/admin/lessons') return null;

  const cityId = url.searchParams.get('cityId');
  const rabbiId = url.searchParams.get('rabbiId');

  if (rabbiId === 'rabbi-1') return jsonResponse(200, { items: rabbi1Lessons, page: 1, pageSize: 50, total: rabbi1Lessons.length });
  if (rabbiId === 'rabbi-no-lessons') return jsonResponse(200, { items: [], page: 1, pageSize: 50, total: 0 });
  if (cityId === 'city-no-matches') return jsonResponse(200, { items: [], page: 1, pageSize: 50, total: 0 });

  if (!cityId && !rabbiId) {
    if (unfilteredScenario === 'loading') return NEVER_RESOLVES;
    if (unfilteredScenario === 'error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
    if (unfilteredScenario === 'empty') return jsonResponse(200, { items: [], page: 1, pageSize: 50, total: 0 });
    return jsonResponse(200, { items: populatedLessons, page: 1, pageSize: 50, total: populatedLessons.length });
  }

  // Falls through rather than answering every other cityId/rabbiId
  // combination: `RabbiViewPage` and `RabbiLessonsSection` mock this same
  // shared endpoint from their own story files, and each file's mock
  // chains onto the last (`.storybook/preview.tsx`), so a catch-all here
  // would swallow their requests too depending on which file's module
  // happened to load last (mirrors `AreaPage.stories.tsx`'s own comment on
  // this same trap).
  return null;
});

// See RabbiPage.stories.tsx for why this uses `Routes`'s `location` override
// instead of a second, nested MemoryRouter.
const withSearch = (search: string, scenario: UnfilteredScenario = 'populated') => (Story: React.ComponentType) => {
  unfilteredScenario = scenario;
  return (
    <Routes location={{ pathname: '/admin/lessons', search, hash: '', state: null, key: 'story' }}>
      <Route path="/admin/lessons" element={<Story />} />
    </Routes>
  );
};

const meta: Meta<typeof LessonsListPage> = {
  title: 'AdminPanel/LessonsListPage',
  component: LessonsListPage,
};

export default meta;
type Story = StoryObj<typeof LessonsListPage>;

export const Populated: Story = { decorators: [withSearch('')] };

// The filter chip, sitting next to city/recurrence/search rather than
// stretching full width, is what this state exists to show.
export const RabbiFiltered: Story = {
  decorators: [withSearch('?rabbiId=rabbi-1&rabbiName=' + encodeURIComponent('אברהם כהן') + '&rabbiHonorific=rav')],
};

export const RabbiFilteredZeroResults: Story = {
  decorators: [withSearch('?rabbiId=rabbi-no-lessons&rabbiName=' + encodeURIComponent('דוד פרץ') + '&rabbiHonorific=rav')],
};

export const CityFilterNoMatches: Story = {
  decorators: [withSearch('?cityId=city-no-matches&cityName=' + encodeURIComponent('דימונה'))],
};

export const SystemEmpty: Story = { decorators: [withSearch('', 'empty')] };
export const Loading: Story = { decorators: [withSearch('', 'loading')] };
export const ServerError: Story = { decorators: [withSearch('', 'error')] };
