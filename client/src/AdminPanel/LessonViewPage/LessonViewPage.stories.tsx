import type { LessonExceptionResponse, LessonOccurrence, LessonResponse, RabbiResponse } from '@torabarabim/common';
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
  venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', cityCode: 4000, cityName: 'חיפה' },
  topic: 'parasha',
  audience: 'mixed',
  recurrence: { kind: 'weekly', weekdays: [2] },
  startTime: '20:30',
  durationMinutes: 60,
  provenance: 'manual',
  ...overrides,
});

// A plain scheduled date with no exception: the occurrences section's
// baseline row, no tag, both write actions enabled.
const scheduledOccurrence = (lessonId: string, overrides: Partial<LessonOccurrence> = {}): LessonOccurrence => ({
  lessonId,
  date: '2026-09-18',
  startTime: '20:30',
  endTime: '21:30',
  status: 'scheduled',
  audience: 'mixed',
  rabbi: rabbiResponse({}),
  venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', floor: undefined, city: 'חיפה', citySlug: 'haifa', area: 'haifa' },
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
        venue: {
          kind: 'address',
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

  // The occurrences section's own dedicated lesson ids: each isolates one
  // state of `useLessonOccurrences` without disturbing the fixtures above,
  // which every other `LessonViewPage` story still depends on.
  if (url.pathname === '/v1/admin/lessons/story-occ-empty') return jsonResponse(200, lesson({ id: 'story-occ-empty' }));
  if (url.pathname === '/v1/admin/lessons/story-occ-loading') return jsonResponse(200, lesson({ id: 'story-occ-loading' }));
  if (url.pathname === '/v1/admin/lessons/story-occ-error') return jsonResponse(200, lesson({ id: 'story-occ-error' }));
  if (url.pathname === '/v1/admin/lessons/story-occ-exceptions-error') return jsonResponse(200, lesson({ id: 'story-occ-exceptions-error' }));
  if (url.pathname === '/v1/admin/lessons/story-occ-longdata') {
    return jsonResponse(
      200,
      lesson({
        id: 'story-occ-longdata',
        venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', cityCode: 4000, cityName: 'חיפה' },
      }),
    );
  }

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

  if (url.pathname === '/v1/admin/lessons/story-populated/occurrences') {
    return jsonResponse(200, {
      items: [
        scheduledOccurrence('story-populated', { date: '2026-09-18' }),
        // Moved: time differs from the lesson's own 20:30, place unchanged.
        scheduledOccurrence('story-populated', { date: '2026-09-25', startTime: '21:15', endTime: '22:15' }),
        // Place changed: time unchanged, venue differs from the lesson's own.
        scheduledOccurrence('story-populated', {
          date: '2026-10-02',
          venue: { kind: 'address', name: 'בית מדרש נוסף', street: 'הרצל 12', floor: undefined, city: 'חיפה', citySlug: 'haifa', area: 'haifa' },
        }),
        // Cancelled, with a reason.
        scheduledOccurrence('story-populated', {
          date: '2026-10-09',
          status: 'cancelled',
          cancellationReason: 'הרב נוסע לשמחה משפחתית',
        }),
      ] satisfies LessonOccurrence[],
    });
  }
  if (url.pathname === '/v1/admin/lessons/story-populated/exceptions') {
    return jsonResponse(200, {
      items: [
        { id: 21, lessonId: 'story-populated', kind: 'modified', date: '2026-09-25', startTime: '21:15' },
        {
          id: 22,
          lessonId: 'story-populated',
          kind: 'modified',
          date: '2026-10-02',
          address: { name: 'בית מדרש נוסף', street: 'הרצל 12', cityCode: 4000, cityName: 'חיפה' },
        },
        { id: 23, lessonId: 'story-populated', kind: 'cancelled', date: '2026-10-09', reason: 'הרב נוסע לשמחה משפחתית' },
      ] satisfies LessonExceptionResponse[],
    });
  }

  if (url.pathname === '/v1/admin/lessons/story-occ-empty/occurrences') return jsonResponse(200, { items: [] });
  if (url.pathname === '/v1/admin/lessons/story-occ-empty/exceptions') return jsonResponse(200, { items: [] });

  if (url.pathname === '/v1/admin/lessons/story-occ-loading/occurrences') return NEVER_RESOLVES;
  if (url.pathname === '/v1/admin/lessons/story-occ-loading/exceptions') return NEVER_RESOLVES;

  if (url.pathname === '/v1/admin/lessons/story-occ-error/occurrences') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (url.pathname === '/v1/admin/lessons/story-occ-error/exceptions') return jsonResponse(200, { items: [] });

  // Occurrences resolve, exceptions fail: the section degrades to a
  // read-only list rather than blanking (LessonViewPage/components/
  // OccurrencesSection/useLessonOccurrences.ts's 'exceptionsUnavailable').
  if (url.pathname === '/v1/admin/lessons/story-occ-exceptions-error/occurrences') {
    return jsonResponse(200, {
      items: [
        scheduledOccurrence('story-occ-exceptions-error', { date: '2026-09-18' }),
        scheduledOccurrence('story-occ-exceptions-error', {
          date: '2026-09-25',
          status: 'cancelled',
          cancellationReason: 'חג',
        }),
      ] satisfies LessonOccurrence[],
    });
  }
  if (url.pathname === '/v1/admin/lessons/story-occ-exceptions-error/exceptions') {
    return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  }

  // Long real data: a long venue name that has to wrap without breaking
  // the row, and a long, free-text cancellation reason.
  if (url.pathname === '/v1/admin/lessons/story-occ-longdata/occurrences') {
    return jsonResponse(200, {
      items: [
        scheduledOccurrence('story-occ-longdata', {
          date: '2026-09-18',
          venue: {
            kind: 'address',
            name: 'בית מדרש "אהבת ישראל" של קהילת יוצאי מרוקו, מרכז קהילתי נאות שקד',
            street: 'שדרות ירושלים 128, קומה שנייה, כניסה מהחצר האחורית',
            floor: undefined,
            city: 'קריית ביאליק',
            citySlug: 'kiryat-bialik',
            area: 'haifa',
          },
        }),
        scheduledOccurrence('story-occ-longdata', {
          date: '2026-09-25',
          status: 'cancelled',
          cancellationReason:
            'השיעור מבוטל השבוע עקב אירוע קהילתי בבית הכנסת, השיעור הבא יתקיים כרגיל בשבוע הבא באותה השעה ובאותו המקום',
        }),
      ] satisfies LessonOccurrence[],
    });
  }
  if (url.pathname === '/v1/admin/lessons/story-occ-longdata/exceptions') {
    return jsonResponse(200, {
      items: [{ id: 31, lessonId: 'story-occ-longdata', kind: 'cancelled', date: '2026-09-25', reason: 'השיעור מבוטל השבוע עקב אירוע קהילתי בבית הכנסת, השיעור הבא יתקיים כרגיל בשבוע הבא באותה השעה ובאותו המקום' }],
    } satisfies { items: LessonExceptionResponse[] });
  }

  // Every lesson story above reaches `OccurrencesSection`, which fetches
  // its own occurrences and exceptions: every id not given a dedicated
  // fixture above gets an empty window here, so a story about the fields
  // grid or the header is not also, incidentally, a story about this
  // section.
  if (/^\/v1\/admin\/lessons\/[^/]+\/occurrences$/.test(url.pathname)) return jsonResponse(200, { items: [] });
  if (/^\/v1\/admin\/lessons\/[^/]+\/exceptions$/.test(url.pathname)) return jsonResponse(200, { items: [] });

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

// The occurrences section's own states, each on a lesson whose other
// fields are unremarkable so the section is the only thing under test.
export const OccurrencesEmpty: Story = { decorators: [withRoute('story-occ-empty')] };
export const OccurrencesLoading: Story = { decorators: [withRoute('story-occ-loading')] };
export const OccurrencesError: Story = { decorators: [withRoute('story-occ-error')] };
export const OccurrencesExceptionsUnavailable: Story = { decorators: [withRoute('story-occ-exceptions-error')] };
export const OccurrencesLongData: Story = { decorators: [withRoute('story-occ-longdata')] };
