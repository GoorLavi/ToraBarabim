import type { LessonResponse, RabbiResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { LessonViewPage } from './LessonViewPage';

const rabbiResponse = (overrides: Partial<RabbiResponse>): RabbiResponse => ({
  ...rabbiFixture({ id: 'story-rabbi', name: 'יעקב מזרחי', title: 'ראש ישיבה' }),
  prominence: 'known',
  ...overrides,
});

const lesson = (overrides: Partial<LessonResponse>): LessonResponse => ({
  id: 'story-lesson',
  title: 'עיונים בפרשת השבוע',
  rabbiId: 'story-rabbi',
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', cityCode: 4000, cityName: 'חיפה' },
  topic: 'parasha',
  audience: 'mixed',
  recurrence: { kind: 'weekly', weekdays: [2] },
  startTime: '20:30',
  durationMinutes: 60,
  provenance: 'manual',
  ...overrides,
});

installMockFetch((url) => {
  if (url.pathname === '/v1/admin/lessons/story-populated') return jsonResponse(200, lesson({}));
  if (url.pathname === '/v1/admin/lessons/story-nophoto') return jsonResponse(200, lesson({ id: 'story-nophoto', rabbiId: 'story-nophoto-rabbi' }));
  if (url.pathname === '/v1/admin/lessons/story-longnames') {
    return jsonResponse(
      200,
      lesson({
        id: 'story-longnames',
        title: 'שיעור עיון מעמיק בהלכות שבת ומועדים לפי שולחן ערוך ומנהגי קהילות המזרח',
        rabbiId: 'story-longnames-rabbi',
        place: {
          name: 'בית מדרש "אהבת ישראל" של קהילת יוצאי מרוקו, מרכז קהילתי נאות שקד',
          street: 'שדרות ירושלים 128, קומה שנייה',
          cityCode: 4000,
          cityName: 'קריית ביאליק',
        },
      }),
    );
  }
  if (url.pathname === '/v1/admin/lessons/story-untitled') {
    return jsonResponse(200, lesson({ id: 'story-untitled', title: undefined, topic: undefined, rabbiId: 'story-untitled-rabbi' }));
  }
  if (url.pathname === '/v1/admin/lessons/story-onetime') {
    return jsonResponse(200, lesson({ id: 'story-onetime', recurrence: { kind: 'once', date: '2026-10-08' } }));
  }
  if (url.pathname === '/v1/admin/lessons/story-rabbi-unknown') {
    return jsonResponse(200, lesson({ id: 'story-rabbi-unknown', title: 'שיעור דף יומי', rabbiId: 'story-rabbi-failing' }));
  }
  if (url.pathname === '/v1/admin/lessons/story-notfound') return jsonResponse(404, { error: 'lesson_not_found', message: 'השיעור לא נמצא' });
  if (url.pathname === '/v1/admin/lessons/story-error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (url.pathname === '/v1/admin/lessons/story-loading') return NEVER_RESOLVES;

  if (url.pathname === '/v1/admin/rabbis/story-rabbi') return jsonResponse(200, rabbiResponse({}));
  if (url.pathname === '/v1/admin/rabbis/story-nophoto-rabbi') {
    return jsonResponse(200, rabbiResponse({ id: 'story-nophoto-rabbi', name: 'משה לוי', title: undefined, photoUrl: undefined }));
  }
  if (url.pathname === '/v1/admin/rabbis/story-longnames-rabbi') {
    return jsonResponse(200, rabbiResponse({ id: 'story-longnames-rabbi', name: 'נתן צבי אשכנזי הכהן', title: 'ראש כולל ורב השכונה' }));
  }
  // Distinct id from `RabbiViewPage.stories.tsx`'s own rabbanit: both files
  // fetch a single rabbi by id under the identical `['admin', 'rabbis',
  // id]` key, and `.storybook/preview.tsx` shares one `QueryClient` across
  // every story, so a shared id would let one file's cached rabbi bleed
  // into the other's story.
  if (url.pathname === '/v1/admin/rabbis/story-untitled-rabbi') {
    return jsonResponse(200, rabbiResponse({ id: 'story-untitled-rabbi', name: 'שרה גולדברג', honorific: 'rabbanit', title: undefined }));
  }
  // The rabbi fetch that fails while the lesson itself loads fine:
  // `useExistingLesson` only treats a failed *lesson* fetch as fatal, so
  // this must degrade to `RABBI_UNKNOWN_LABEL` with the rest of the lesson
  // rendering normally, never a blank page.
  if (url.pathname === '/v1/admin/rabbis/story-rabbi-failing') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });

  return null;
});

// See RabbiPage.stories.tsx for why this uses `Routes`'s `location` override
// instead of a second, nested MemoryRouter.
const withRoute = (id: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/admin/lessons/${id}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/admin/lessons/:id" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof LessonViewPage> = {
  title: 'AdminPanel/LessonViewPage',
  component: LessonViewPage,
};

export default meta;
type Story = StoryObj<typeof LessonViewPage>;

export const Populated: Story = { decorators: [withRoute('story-populated')] };
export const RabbiWithNoPhoto: Story = { decorators: [withRoute('story-nophoto')] };
export const LongTitleAndVenue: Story = { decorators: [withRoute('story-longnames')] };
export const UntitledFallsBackToRabbi: Story = { decorators: [withRoute('story-untitled')] };
export const OneTime: Story = { decorators: [withRoute('story-onetime')] };
export const RabbiFetchFailed: Story = { decorators: [withRoute('story-rabbi-unknown')] };
export const NotFound: Story = { decorators: [withRoute('story-notfound')] };
export const ServerError: Story = { decorators: [withRoute('story-error')] };
export const Loading: Story = { decorators: [withRoute('story-loading')] };
