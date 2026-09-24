import type { LessonExceptionResponse, LessonOccurrence, LessonResponse, RabbiResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../../.storybook/apiMocks';
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

const LONG_CANCELLATION_REASON = 'השיעור מבוטל השבוע עקב אירוע קהילתי בבית הכנסת, השיעור הבא יתקיים כרגיל בשבוע הבא באותה השעה ובאותו המקום';

const additionalVenue = { kind: 'address', name: 'בית מדרש נוסף', street: 'הרצל 12', floor: undefined, city: 'חיפה', citySlug: 'haifa', area: 'haifa' } as const;

const populatedOccurrences: LessonOccurrence[] = [
  scheduledOccurrence('story-populated', { date: '2026-09-18' }),
  // Moved: time differs from the lesson's own 20:30, place unchanged.
  scheduledOccurrence('story-populated', { date: '2026-09-25', startTime: '21:15', endTime: '22:15' }),
  // Place changed: time unchanged, venue differs from the lesson's own.
  scheduledOccurrence('story-populated', { date: '2026-10-02', venue: additionalVenue }),
  // Cancelled, with a reason.
  scheduledOccurrence('story-populated', { date: '2026-10-09', status: 'cancelled', cancellationReason: 'הרב נוסע לשמחה משפחתית' }),
];

const populatedExceptions: LessonExceptionResponse[] = [
  { id: 21, lessonId: 'story-populated', kind: 'modified', date: '2026-09-25', startTime: '21:15' },
  {
    id: 22,
    lessonId: 'story-populated',
    kind: 'modified',
    date: '2026-10-02',
    address: { name: 'בית מדרש נוסף', street: 'הרצל 12', cityCode: 4000, cityName: 'חיפה' },
  },
  { id: 23, lessonId: 'story-populated', kind: 'cancelled', date: '2026-10-09', reason: 'הרב נוסע לשמחה משפחתית' },
];

// Long real data: a long venue name that has to wrap without breaking the
// row, and a long, free-text cancellation reason.
const longDataOccurrences: LessonOccurrence[] = [
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
  scheduledOccurrence('story-occ-longdata', { date: '2026-09-25', status: 'cancelled', cancellationReason: LONG_CANCELLATION_REASON }),
];

const longDataExceptions: LessonExceptionResponse[] = [
  { id: 31, lessonId: 'story-occ-longdata', kind: 'cancelled', date: '2026-09-25', reason: LONG_CANCELLATION_REASON },
];

// Occurrences resolve, exceptions fail: the section degrades to a read-only
// list rather than blanking (OccurrencesSection/useLessonOccurrences.ts's
// 'exceptionsUnavailable').
const exceptionsUnavailableOccurrences: LessonOccurrence[] = [
  scheduledOccurrence('story-occ-exceptions-error', { date: '2026-09-18' }),
  scheduledOccurrence('story-occ-exceptions-error', { date: '2026-09-25', status: 'cancelled', cancellationReason: 'חג' }),
];

const lessonHandler = (response: LessonResponse) => http.get('/v1/admin/lessons/:id', jsonResolver(response));
const rabbiHandler = (response: RabbiResponse) => http.get('/v1/admin/rabbis/:id', jsonResolver(response));
const occurrencesHandler = (items: LessonOccurrence[]) => http.get('/v1/admin/lessons/:id/occurrences', jsonResolver({ items }));
const exceptionsHandler = (items: LessonExceptionResponse[]) => http.get('/v1/admin/lessons/:id/exceptions', jsonResolver({ items }));

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
  // Every story reaches `OccurrencesSection`, which fetches its own
  // occurrences and exceptions: the default is an empty window, so a story
  // about the fields grid or the header is not also, incidentally, a story
  // about that section.
  parameters: {
    apiMocks: {
      handlers: {
        lesson: lessonHandler(lesson({})),
        rabbi: rabbiHandler(rabbiResponse({})),
        occurrences: occurrencesHandler([]),
        exceptions: exceptionsHandler([]),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LessonViewPage>;

export const Populated: Story = {
  decorators: [withRoute('story-populated')],
  parameters: { apiMocks: { handlers: { occurrences: occurrencesHandler(populatedOccurrences), exceptions: exceptionsHandler(populatedExceptions) } } },
};
export const RabbiWithNoPhoto: Story = {
  decorators: [withRoute('story-nophoto')],
  parameters: {
    apiMocks: { handlers: { rabbi: rabbiHandler(rabbiResponse({ id: 'story-nophoto-rabbi', name: 'משה לוי', title: undefined, photoUrl: undefined })) } },
  },
};
export const LongTitleAndVenue: Story = {
  decorators: [withRoute('story-longnames')],
  parameters: {
    apiMocks: {
      handlers: {
        lesson: lessonHandler(
          lesson({
            id: 'story-longnames',
            title: 'שיעור עיון מעמיק בהלכות שבת ומועדים לפי שולחן ערוך ומנהגי קהילות המזרח',
            venue: {
              kind: 'address',
              name: 'בית מדרש "אהבת ישראל" של קהילת יוצאי מרוקו, מרכז קהילתי נאות שקד',
              street: 'שדרות ירושלים 128, קומה שנייה',
              cityCode: 4000,
              cityName: 'קריית ביאליק',
            },
          }),
        ),
        rabbi: rabbiHandler(rabbiResponse({ id: 'story-longnames-rabbi', name: 'נתן צבי אשכנזי הכהן', title: 'ראש כולל ורב השכונה' })),
      },
    },
  },
};
export const UntitledFallsBackToRabbi: Story = {
  decorators: [withRoute('story-untitled')],
  parameters: {
    apiMocks: {
      handlers: {
        lesson: lessonHandler(lesson({ id: 'story-untitled', title: undefined, topic: undefined })),
        rabbi: rabbiHandler(rabbiResponse({ id: 'story-untitled-rabbi', name: 'שרה גולדברג', honorific: 'rabbanit', title: undefined })),
      },
    },
  },
};
export const OneTime: Story = {
  decorators: [withRoute('story-onetime')],
  parameters: { apiMocks: { handlers: { lesson: lessonHandler(lesson({ id: 'story-onetime', recurrence: { kind: 'once', date: '2026-10-08' } })) } } },
};
// The rabbi fetch fails while the lesson itself loads fine:
// `useExistingLesson` only treats a failed lesson fetch as fatal, so this
// must degrade to `RABBI_UNKNOWN_LABEL` with the rest of the lesson
// rendering normally, never a blank page.
export const RabbiFetchFailed: Story = {
  decorators: [withRoute('story-rabbi-unknown')],
  parameters: {
    apiMocks: {
      handlers: {
        lesson: lessonHandler(lesson({ id: 'story-rabbi-unknown', title: 'שיעור דף יומי' })),
        rabbi: http.get('/v1/admin/rabbis/:id', errorResolver()),
      },
    },
  },
};
export const NotFound: Story = {
  decorators: [withRoute('story-notfound')],
  parameters: { apiMocks: { handlers: { lesson: http.get('/v1/admin/lessons/:id', errorResolver(404, 'lesson_not_found', 'השיעור לא נמצא')) } } },
};
export const ServerError: Story = {
  decorators: [withRoute('story-error')],
  parameters: { apiMocks: { handlers: { lesson: http.get('/v1/admin/lessons/:id', errorResolver()) } } },
};
export const Loading: Story = {
  decorators: [withRoute('story-loading')],
  parameters: { apiMocks: { handlers: { lesson: http.get('/v1/admin/lessons/:id', loadingResolver) } } },
};

// The occurrences section's own states, each on a lesson whose other
// fields are unremarkable so the section is the only thing under test.
export const OccurrencesEmpty: Story = { decorators: [withRoute('story-occ-empty')] };
export const OccurrencesLoading: Story = {
  decorators: [withRoute('story-occ-loading')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrences: http.get('/v1/admin/lessons/:id/occurrences', loadingResolver),
        exceptions: http.get('/v1/admin/lessons/:id/exceptions', loadingResolver),
      },
    },
  },
};
export const OccurrencesError: Story = {
  decorators: [withRoute('story-occ-error')],
  parameters: { apiMocks: { handlers: { occurrences: http.get('/v1/admin/lessons/:id/occurrences', errorResolver()) } } },
};
export const OccurrencesExceptionsUnavailable: Story = {
  decorators: [withRoute('story-occ-exceptions-error')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrences: occurrencesHandler(exceptionsUnavailableOccurrences),
        exceptions: http.get('/v1/admin/lessons/:id/exceptions', errorResolver()),
      },
    },
  },
};
export const OccurrencesLongData: Story = {
  decorators: [withRoute('story-occ-longdata')],
  parameters: { apiMocks: { handlers: { occurrences: occurrencesHandler(longDataOccurrences), exceptions: exceptionsHandler(longDataExceptions) } } },
};
