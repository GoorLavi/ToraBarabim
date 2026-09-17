import type { LessonResponse, RabbiResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { RabbiViewPage } from './RabbiViewPage';

const rabbiResponse = (overrides: Partial<RabbiResponse>): RabbiResponse => ({
  ...rabbiFixture({
    id: 'story-populated',
    name: 'יעקב מזרחי',
    title: 'ראש ישיבה',
    photoUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="260" height="347"><rect width="260" height="347" fill="lightgray"/></svg>'),
    bio: 'ראש ישיבת "אור התורה" ומגידי השיעור הוותיקים בעיר. מלמד גמרא והלכה מזה למעלה מעשרים שנה.',
  }),
  prominence: 'known',
  ...overrides,
});

const lesson = (overrides: Partial<LessonResponse>): LessonResponse => ({
  id: 'l1',
  title: 'עיונים בפרשת השבוע',
  rabbiId: 'story-populated',
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', cityCode: 4000, cityName: 'חיפה' },
  topic: 'parasha',
  audience: 'mixed',
  recurrence: { kind: 'weekly', weekdays: [2] },
  startTime: '20:30',
  durationMinutes: 60,
  provenance: 'manual',
  ...overrides,
});

const manyLessons: LessonResponse[] = Array.from({ length: 5 }, (_, index) =>
  lesson({ id: `many-${index}`, rabbiId: 'story-manylessons', recurrence: { kind: 'weekly', weekdays: [(index % 6) as 0 | 1 | 2 | 3 | 4 | 5 | 6] } }),
);

installMockFetch((url) => {
  if (url.pathname === '/v1/admin/rabbis/story-populated') return jsonResponse(200, rabbiResponse({}));
  if (url.pathname === '/v1/admin/rabbis/story-rabbanit') {
    return jsonResponse(200, rabbiResponse({ id: 'story-rabbanit', name: 'שרה גולדברג', honorific: 'rabbanit', title: 'רבנית הקהילה' }));
  }
  if (url.pathname === '/v1/admin/rabbis/story-nophoto') {
    return jsonResponse(200, rabbiResponse({ id: 'story-nophoto', name: 'משה לוי', photoUrl: undefined }));
  }
  if (url.pathname === '/v1/admin/rabbis/story-notitlebio') {
    return jsonResponse(200, rabbiResponse({ id: 'story-notitlebio', name: 'דוד אברג׳יל', title: undefined, bio: undefined, photoUrl: undefined }));
  }
  if (url.pathname === '/v1/admin/rabbis/story-emptylessons') {
    return jsonResponse(200, rabbiResponse({ id: 'story-emptylessons', name: 'אברהם כהן', photoUrl: undefined }));
  }
  if (url.pathname === '/v1/admin/rabbis/story-manylessons') {
    return jsonResponse(200, rabbiResponse({ id: 'story-manylessons', name: 'נתן צבי אשכנזי הכהן', photoUrl: undefined }));
  }
  if (url.pathname === '/v1/admin/rabbis/story-lessonserror') {
    return jsonResponse(200, rabbiResponse({ id: 'story-lessonserror', name: 'שמואל וקנין', photoUrl: undefined }));
  }
  if (url.pathname === '/v1/admin/rabbis/story-notfound') return jsonResponse(404, { error: 'rabbi_not_found', message: 'לא נמצא' });
  if (url.pathname === '/v1/admin/rabbis/story-error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (url.pathname === '/v1/admin/rabbis/story-loading') return NEVER_RESOLVES;

  if (url.pathname === '/v1/admin/lessons') {
    const rabbiId = url.searchParams.get('rabbiId');
    if (rabbiId === 'story-populated') return jsonResponse(200, { items: [lesson({}), lesson({ id: 'l2', startTime: '06:00' })], page: 1, pageSize: 5, total: 2 });
    if (rabbiId === 'story-manylessons') return jsonResponse(200, { items: manyLessons, page: 1, pageSize: 5, total: 9 });
    // The lessons section erroring while the profile above it still
    // renders: `RabbiLessonsSection` owns this query independently of
    // `RabbiViewPage`'s own profile fetch above, and this state was never
    // seen before this slice.
    if (rabbiId === 'story-lessonserror') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
    return jsonResponse(200, { items: [], page: 1, pageSize: 5, total: 0 });
  }

  return null;
});

// See RabbiPage.stories.tsx for why this uses `Routes`'s `location` override
// instead of a second, nested MemoryRouter.
const withRoute = (id: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/admin/rabbis/${id}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/admin/rabbis/:id" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof RabbiViewPage> = {
  title: 'AdminPanel/RabbiViewPage',
  component: RabbiViewPage,
};

export default meta;
type Story = StoryObj<typeof RabbiViewPage>;

export const Populated: Story = { decorators: [withRoute('story-populated')] };
export const Rabbanit: Story = { decorators: [withRoute('story-rabbanit')] };
export const NoPhoto: Story = { decorators: [withRoute('story-nophoto')] };
export const NoTitleAndNoBio: Story = { decorators: [withRoute('story-notitlebio')] };
export const NoLessonsYet: Story = { decorators: [withRoute('story-emptylessons')] };
export const MoreThanCapWithSeeAll: Story = { decorators: [withRoute('story-manylessons')] };
export const LessonsSectionFailedProfileOk: Story = { decorators: [withRoute('story-lessonserror')] };
export const NotFound: Story = { decorators: [withRoute('story-notfound')] };
export const ServerError: Story = { decorators: [withRoute('story-error')] };
export const Loading: Story = { decorators: [withRoute('story-loading')] };
