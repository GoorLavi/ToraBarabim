import type { LessonOccurrence, LessonOccurrenceDetail } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Route, Routes } from 'react-router-dom';

import { LESSONS_NEXT_LABEL } from '~/components/Rail/consts';
import * as reportConsts from '~/components/ReportMistake/consts';
import { SHARE_LABEL } from '~/components/ShareButton/consts';
import { areaLinkLabel } from '~/consts';
import { rabbiDisplayName } from '~/helpers';
import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../.storybook/apiMocks';
import { ADD_TO_CALENDAR_LABEL } from './components/LessonActions/consts';
import { GOOGLE_MAPS_ARIA_LABEL, WAZE_ARIA_LABEL } from './components/LessonTicket/consts';
import { PAST_NOTICE_LABEL, rabbiRailTitle, TEACHING_RABBI_ROLE_LABEL } from './consts';
import { LessonPage } from './LessonPage';
import type { AreaPreview, DeferredLessons } from './models';

// A minimal, valid SVG portrait so every photo story stays off the network
// (mirrors LessonTicket.stories.tsx).
const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="lightgray"/></svg>',
  );

// A row that never settles, so the `Suspense` fallback stays on screen.
const PENDING_LESSONS = new Promise<DeferredLessons>(() => {});

const ready = (items: LessonOccurrence[]): Promise<DeferredLessons> => Promise.resolve({ kind: 'ready', items });
const UNAVAILABLE: Promise<DeferredLessons> = Promise.resolve({ kind: 'unavailable' });

// A read whose promise rejects (a truncated stream, a dropped connection),
// distinct from the loader's own `unavailable` result. The no-op `catch` only
// marks it handled so the module load does not report an unhandled rejection;
// `Await` still sees the rejection.
const rejectedLessons = (): Promise<DeferredLessons> => {
  const rejected = Promise.reject<DeferredLessons>(new Error('story: the deferred read rejected'));
  rejected.catch(() => {});
  return rejected;
};

const baseLesson: LessonOccurrence = {
  lessonId: 'lesson-1',
  date: '2026-09-08',
  startTime: '20:30',
  endTime: '21:30',
  status: 'scheduled',
  title: 'עיונים בפרשת השבוע',
  topic: 'parasha',
  audience: 'mixed',
  // The deliberate photoless case (LessonTicket's "closed slot"): every
  // other rabbi fixture below carries a photo now that rabbiFixture defaults
  // one in, and the stories below explain why this one stays pinned (design
  // gate finding F10).
  rabbi: rabbiFixture({ id: 'rabbi-1', name: 'יעקב מזרחי', photoUrl: undefined }),
  venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
};

const WEEKLY_ON_TUESDAYS: LessonOccurrenceDetail['schedule'] = { kind: 'weekly', weekdays: [2], startTime: '20:30' };

const plusOneWeek = (isoDate: string): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 7);
  return date.toISOString().slice(0, 10);
};

// A weekly lesson unless a story says otherwise. Its calendar date is this
// occurrence when it is scheduled and upcoming, else the same lesson a week
// on, the way the server resolves it; a one-time lesson passes
// `calendarOccurrence: null` for a date that is gone.
const lesson = (overrides: Partial<LessonOccurrenceDetail>): LessonOccurrenceDetail => {
  const { timing = 'upcoming', schedule = WEEKLY_ON_TUESDAYS, calendarOccurrence, ...fields } = overrides;
  const occurrence: LessonOccurrence = { ...baseLesson, ...fields };
  const nextWeek: LessonOccurrence = { ...occurrence, date: plusOneWeek(occurrence.date), status: 'scheduled', cancellationReason: undefined };
  const isAddable = occurrence.status === 'scheduled' && timing === 'upcoming';

  return { ...occurrence, timing, schedule, calendarOccurrence: calendarOccurrence !== undefined ? calendarOccurrence : isAddable ? occurrence : nextWeek };
};

// A card in either row: no `timing`, because list responses do not carry one.
const railLesson = (index: number, overrides: Partial<LessonOccurrence> = {}): LessonOccurrence => ({
  ...baseLesson,
  lessonId: `rail-${index}`,
  date: `2026-09-${String(8 + index).padStart(2, '0')}`,
  rabbi: rabbiFixture({ id: `rail-rabbi-${index}`, name: `רב תצוגה ${index}`, photoUrl: PLACEHOLDER_PHOTO }),
  ...overrides,
});

const areaRail = (count: number): LessonOccurrence[] => Array.from({ length: count }, (_, index) => railLesson(index + 1));

const AREA_NAME = 'השרון';

const areaPreview = (lessons: Promise<DeferredLessons>): AreaPreview => ({
  areaName: AREA_NAME,
  areaSlug: 'השרון',
  lessons,
});

// The rabbi row of the lesson on screen: his own lessons, so the same rabbi
// on every card, the soonest first.
const rabbiRail = (rabbi: LessonOccurrence['rabbi'], count: number): LessonOccurrence[] =>
  Array.from({ length: count }, (_, index) =>
    railLesson(index + 1, { lessonId: `own-${index}`, rabbi, startTime: index % 2 === 0 ? '20:30' : '06:00' }),
  );

const occurrenceHandler = (occurrence: LessonOccurrenceDetail) =>
  http.get('/v1/lessons/:lessonId/occurrences/:date', jsonResolver(occurrence));

const populatedRabbi = rabbiFixture({ id: 'rabbi-populated', name: 'יעקב מזרחי', photoUrl: PLACEHOLDER_PHOTO });
const rabbanit = rabbiFixture({ id: 'rabbanit-1', name: 'שרה לוי', honorific: 'rabbanit', photoUrl: PLACEHOLDER_PHOTO });

const populatedLesson = lesson({ lessonId: 'lesson-populated', rabbi: populatedRabbi });

const longNamesRabbi = rabbiFixture({
  id: 'rabbi-long',
  name: 'פרופסור יהודה אריה לייב הכהן שוורצנברג-אייזנשטיין',
  photoUrl: PLACEHOLDER_PHOTO,
});

const longNamesLesson = lesson({
  lessonId: 'lesson-long',
  rabbi: longNamesRabbi,
  venue: {
    kind: 'address',
    name: 'בית הכנסת הגדול "היכל התורה והתפילה"',
    street: 'רחוב הרב קוק הראשי 128',
    city: 'קריית מלאכי והמושבים הסמוכים לה בעוטף עזה',
    citySlug: 'קריית-מלאכי-והמושבים-הסמוכים-לה-בעוטף-עזה',
    area: 'south',
  },
});

const withRoute = (lessonId: string, date: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/lesson/${encodeURIComponent(lessonId)}/${date}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/lesson/:lessonId/:date" element={<Story />} />
  </Routes>
);

// Waze and Google Maps are the two links a lesson that already happened must
// not offer.
const navigationLinks = (canvas: ReturnType<typeof within>) => [
  canvas.queryByLabelText(WAZE_ARIA_LABEL),
  canvas.queryByLabelText(GOOGLE_MAPS_ARIA_LABEL),
];

// What the actions row offers, read off the page: the share and calendar
// buttons, and the report line that closes the page.
const actionButtons = (canvas: ReturnType<typeof within>) => ({
  share: canvas.queryByRole('button', { name: SHARE_LABEL }),
  calendar: canvas.queryByRole('button', { name: ADD_TO_CALENDAR_LABEL }),
});

const reportButton = (canvas: ReturnType<typeof within>) => canvas.findByRole('button', { name: new RegExp(reportConsts.REPORT_PROMPT_ACTION) });

const rabbiRowTitle = rabbiRailTitle(rabbiDisplayName(populatedRabbi));
const areaRowTitle = areaLinkLabel(AREA_NAME);

const DESKTOP_VIEWPORT = { viewport: { value: 'desktop', isRotated: false } };

// The 320 phone is the narrowest width the site supports; Storybook ships no
// preset for it, so this story declares its own.
const NARROW_VIEWPORT = {
  globals: { viewport: { value: 'narrow', isRotated: false } },
  parameters: { viewport: { options: { narrow: { name: 'Narrow 320', styles: { width: '320px', height: '100%' }, type: 'mobile' } } } },
} as const;

const meta: Meta<typeof LessonPage> = {
  title: 'LessonPage/LessonPage',
  component: LessonPage,
  args: { rabbiLessons: ready([]), areaPreview: areaPreview(ready([])) },
};

export default meta;
type Story = StoryObj<typeof LessonPage>;

const readyRows = (rabbi: LessonOccurrence['rabbi'] = populatedRabbi) => ({
  rabbiLessons: ready(rabbiRail(rabbi, 4)),
  areaPreview: areaPreview(ready(areaRail(6))),
});

// An ordinary upcoming date, both rows populated. The teaching rabbi carries
// a poster, the real worst case for the ticket's layout (a photoless ticket
// is its own, separate variant).
export const AreaPreviewPopulated: Story = {
  decorators: [withRoute('lesson-populated', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(populatedLesson) } } },
  args: readyRows(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await reportButton(canvas);
    const { share, calendar } = actionButtons(canvas);
    await expect(share).toBeVisible();
    await expect(calendar).toBeVisible();
  },
};

// The report line opens a window that names the lesson it is about.
export const ReportOpensWithTheLesson: Story = {
  decorators: [withRoute('lesson-populated', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(populatedLesson) } } },
  args: readyRows(),
  play: async ({ canvasElement }) => {
    await userEvent.click(await reportButton(within(canvasElement)));

    const dialog = await within(document.body).findByRole('dialog', { name: reportConsts.REPORT_WINDOW_TITLE });
    await expect(within(dialog).getByText(reportConsts.REPORT_CONTEXT_LABELS.lesson)).toBeInTheDocument();
    await expect(within(dialog).getByText('עיונים בפרשת השבוע עם הרב יעקב מזרחי')).toBeInTheDocument();
    await expect(within(dialog).getByText('יום שלישי, 8 בספטמבר, בשעה 20:30')).toBeInTheDocument();
  },
};

// A one-time lesson ahead: share and calendar are both there, and the
// calendar button opens a sheet that asks only which calendar.
export const OneTimeUpcoming: Story = {
  decorators: [withRoute('lesson-once-ahead', '2026-09-08')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrence: occurrenceHandler(lesson({ lessonId: 'lesson-once-ahead', schedule: { kind: 'once' }, calendarOccurrence: { ...baseLesson, lessonId: 'lesson-once-ahead' }, rabbi: populatedRabbi })),
      },
    },
  },
  args: readyRows(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await reportButton(canvas);
    const { share, calendar } = actionButtons(canvas);
    await expect(share).toBeVisible();
    await expect(calendar).toBeVisible();
  },
};

// A men-only or women-only lesson keeps its actions: the audience goes into
// the share text, not into whether the row shows.
export const WomenOnlyUpcoming: Story = {
  decorators: [withRoute('lesson-women', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(lesson({ lessonId: 'lesson-women', audience: 'women', rabbi: rabbanit })) } } },
  args: readyRows(rabbanit),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await reportButton(canvas);
    const { share, calendar } = actionButtons(canvas);
    await expect(share).toBeVisible();
    await expect(calendar).toBeVisible();
  },
};

// Both rows still loading: the real titles and links already on screen, the
// cards as skeletons (frame J).
export const AreaPreviewLoading: Story = {
  decorators: [withRoute('lesson-1', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(lesson({})) } } },
  args: { rabbiLessons: PENDING_LESSONS, areaPreview: areaPreview(PENDING_LESSONS) },
};

export const AreaPreviewEmpty: Story = {
  decorators: [withRoute('lesson-1', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(lesson({})) } } },
  args: { rabbiLessons: ready(rabbiRail(populatedRabbi, 2)), areaPreview: areaPreview(ready([])) },
};

// The area read failed: the ticket stays correct and that section renders
// nothing.
export const AreaPreviewUnavailable: Story = {
  decorators: [withRoute('lesson-1', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(lesson({})) } } },
  args: { rabbiLessons: ready(rabbiRail(populatedRabbi, 2)), areaPreview: areaPreview(UNAVAILABLE) },
};

// The note sits by the ticket, the bio below both rows.
export const NoteAndBio: Story = {
  decorators: [withRoute('lesson-note', '2026-09-08')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrence: occurrenceHandler(
          lesson({
            lessonId: 'lesson-note',
            rabbi: { ...populatedRabbi, bio: 'ראש ישיבת "אור התורה" ומגידי השיעור הוותיקים בעיר. מלמד גמרא והלכה מזה למעלה מעשרים שנה.' },
            note: 'השיעור יתקיים בחדר הקטן בקומה הראשונה.',
          }),
        ),
      },
    },
  },
  args: readyRows(),
};

// B: a weekly lesson whose date already passed. Navigation is gone, the
// notice says so, and the rabbi row leads with this lesson's next dates.
export const WeeklyPast: Story = {
  decorators: [withRoute('lesson-past', '2026-09-01')],
  parameters: {
    apiMocks: { handlers: { occurrence: occurrenceHandler(lesson({ lessonId: 'lesson-past', date: '2026-09-01', timing: 'tookPlace', rabbi: populatedRabbi })) } },
  },
  args: readyRows(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText(PAST_NOTICE_LABEL.tookPlace)).toBeVisible();
    await expect(navigationLinks(canvas)).toEqual([null, null]);
  },
};

// C: a one-time lesson that already happened, the rabbi still has others.
export const OneTimePast: Story = {
  decorators: [withRoute('lesson-once', '2026-08-20')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrence: occurrenceHandler(
          lesson({
            lessonId: 'lesson-once',
            date: '2026-08-20',
            timing: 'tookPlace',
            title: 'שיעור מיוחד לכבוד ראש חודש',
            rabbi: populatedRabbi,
            schedule: { kind: 'once' },
            calendarOccurrence: null,
          }),
        ),
      },
    },
  },
  args: { rabbiLessons: ready(rabbiRail(populatedRabbi, 2)), areaPreview: areaPreview(ready(areaRail(6))) },
  // Nothing to share or add for a lesson that is over; the report stays.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await reportButton(canvas);
    await expect(actionButtons(canvas)).toEqual({ share: null, calendar: null });
  },
};

// A one-time lesson cancelled for a date still ahead: no date will happen,
// so no actions, and the report stays.
export const OneTimeCancelled: Story = {
  decorators: [withRoute('lesson-once-cancelled', '2026-09-15')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrence: occurrenceHandler(
          lesson({
            lessonId: 'lesson-once-cancelled',
            date: '2026-09-15',
            status: 'cancelled',
            cancellationReason: 'השיעור מבוטל השבוע עקב אירוע משפחתי אצל הרב',
            rabbi: populatedRabbi,
            schedule: { kind: 'once' },
            calendarOccurrence: null,
          }),
        ),
      },
    },
  },
  args: readyRows(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await reportButton(canvas);
    await expect(actionButtons(canvas)).toEqual({ share: null, calendar: null });
  },
};

// D: the rabbi has nothing coming up. The heading stays as a link, over an
// empty card, then the area row.
export const RabbiHasNoUpcoming: Story = {
  decorators: [withRoute('lesson-once', '2026-08-20')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrence: occurrenceHandler(lesson({ lessonId: 'lesson-once', date: '2026-08-20', timing: 'tookPlace', rabbi: populatedRabbi })),
      },
    },
  },
  args: { rabbiLessons: ready([]), areaPreview: areaPreview(ready(areaRail(6))) },
};

// E: a rabbanit's role label changes tense with the date.
export const RabbanitPast: Story = {
  decorators: [withRoute('lesson-rabbanit', '2026-09-01')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrence: occurrenceHandler(
          lesson({ lessonId: 'lesson-rabbanit', date: '2026-09-01', timing: 'tookPlace', audience: 'women', rabbi: rabbanit }),
        ),
      },
    },
  },
  args: readyRows(rabbanit),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText(TEACHING_RABBI_ROLE_LABEL.rabbanit.tookPlace)).toBeVisible();
  },
};

export const RabbanitStarted: Story = {
  decorators: [withRoute('lesson-rabbanit', '2026-09-08')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrence: occurrenceHandler(
          lesson({ lessonId: 'lesson-rabbanit', timing: 'startedPastGrace', audience: 'women', rabbi: rabbanit }),
        ),
      },
    },
  },
  args: readyRows(rabbanit),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText(TEACHING_RABBI_ROLE_LABEL.rabbanit.startedPastGrace)).toBeVisible();
  },
};

// F: today, 30 minutes or more after the start. Told so, but nothing is
// taken away: navigation stays, the time is not struck, the gold stays.
export const TodayAfterStart: Story = {
  decorators: [withRoute('lesson-populated', '2026-09-08')],
  parameters: {
    apiMocks: { handlers: { occurrence: occurrenceHandler(lesson({ lessonId: 'lesson-populated', timing: 'startedPastGrace', rabbi: populatedRabbi })) } },
  },
  args: readyRows(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText(PAST_NOTICE_LABEL.startedPastGrace)).toBeVisible();
    await expect(navigationLinks(canvas).every((link) => link !== null)).toBe(true);

    const time = canvasElement.querySelector('.timeCol > .time');
    if (!time) throw new Error('TodayAfterStart story: the ticket start time was not found');
    await expect(getComputedStyle(time).textDecorationLine).not.toContain('line-through');
  },
};

// A cancelled date, past or ahead: one banner (the cancellation wins), the
// start time struck.
export const CancelledPast: Story = {
  decorators: [withRoute('lesson-cancelled', '2026-09-01')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrence: occurrenceHandler(
          lesson({
            lessonId: 'lesson-cancelled',
            date: '2026-09-01',
            timing: 'tookPlace',
            status: 'cancelled',
            cancellationReason: 'השיעור מבוטל השבוע עקב אירוע משפחתי אצל הרב',
            rabbi: populatedRabbi,
          }),
        ),
      },
    },
  },
  args: readyRows(),
};

export const CancelledUpcoming: Story = {
  decorators: [withRoute('lesson-cancelled', '2026-09-15')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrence: occurrenceHandler(
          lesson({
            lessonId: 'lesson-cancelled',
            date: '2026-09-15',
            status: 'cancelled',
            cancellationReason: 'השיעור מבוטל השבוע עקב אירוע משפחתי אצל הרב',
            rabbi: populatedRabbi,
          }),
        ),
      },
    },
  },
  args: readyRows(),
  // The pattern is still true on a weekly lesson's cancelled date: share and
  // calendar stay, and the calendar adds the next scheduled date.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await reportButton(canvas);
    const { share, calendar } = actionButtons(canvas);
    await expect(share).toBeVisible();
    await expect(calendar).toBeVisible();
  },
};

// A rabbanit's cancelled date keeps the plain future label while it is
// ahead, and turns to "was supposed to" only once it is past.
export const RabbanitCancelledUpcoming: Story = {
  decorators: [withRoute('lesson-rabbanit', '2026-09-15')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrence: occurrenceHandler(
          lesson({ lessonId: 'lesson-rabbanit', date: '2026-09-15', status: 'cancelled', audience: 'women', rabbi: rabbanit }),
        ),
      },
    },
  },
  args: readyRows(rabbanit),
};

export const RabbanitCancelledPast: Story = {
  decorators: [withRoute('lesson-rabbanit', '2026-09-01')],
  parameters: {
    apiMocks: {
      handlers: {
        occurrence: occurrenceHandler(
          lesson({ lessonId: 'lesson-rabbanit', date: '2026-09-01', timing: 'tookPlace', status: 'cancelled', audience: 'women', rabbi: rabbanit }),
        ),
      },
    },
  },
  args: readyRows(rabbanit),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText(TEACHING_RABBI_ROLE_LABEL.rabbanit.cancelledPast)).toBeVisible();
  },
};

// The rabbi row's own cancelled card, followed by that lesson's next
// scheduled date.
export const RabbiRowWithCancelledCard: Story = {
  decorators: [withRoute('lesson-populated', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(populatedLesson) } } },
  args: {
    rabbiLessons: ready([
      railLesson(1, { lessonId: 'lesson-populated', rabbi: populatedRabbi, status: 'cancelled', cancellationReason: 'מבוטל' }),
      railLesson(2, { lessonId: 'lesson-populated', rabbi: populatedRabbi }),
      railLesson(3, { lessonId: 'other-own', rabbi: populatedRabbi }),
    ]),
    areaPreview: areaPreview(ready(areaRail(6))),
  },
};

// G: the 320 phone with the longest names and a wrapping rail title.
export const NarrowLongNames: Story = {
  ...NARROW_VIEWPORT,
  decorators: [withRoute('lesson-long', '2026-09-01')],
  parameters: {
    ...NARROW_VIEWPORT.parameters,
    apiMocks: { handlers: { occurrence: occurrenceHandler({ ...longNamesLesson, date: '2026-09-01', timing: 'tookPlace' }) } },
  },
  args: {
    rabbiLessons: ready(rabbiRail(longNamesRabbi, 3)),
    areaPreview: { areaName: 'השפלה והמרכז הדרומי של הארץ', areaSlug: 'השפלה', lessons: ready(areaRail(4)) },
  },
};

// L: only the next date exists, so the row has one card and both arrows are
// disabled.
export const OnlyTheNextDate: Story = {
  decorators: [withRoute('lesson-past', '2026-09-01')],
  parameters: {
    apiMocks: { handlers: { occurrence: occurrenceHandler(lesson({ lessonId: 'lesson-past', date: '2026-09-01', timing: 'tookPlace', rabbi: populatedRabbi })) } },
  },
  args: { rabbiLessons: ready(rabbiRail(populatedRabbi, 1)), areaPreview: areaPreview(ready(areaRail(6))) },
};

// I: the desktop page, where the rail overflows the 928 page column (880 plus
// 24 each side) by the page's own padding and is clipped there, not at the
// screen edge.
export const DesktopBothRows: Story = {
  globals: DESKTOP_VIEWPORT,
  decorators: [withRoute('lesson-past', '2026-09-01')],
  parameters: {
    apiMocks: { handlers: { occurrence: occurrenceHandler(lesson({ lessonId: 'lesson-past', date: '2026-09-01', timing: 'tookPlace', rabbi: populatedRabbi })) } },
  },
  args: { rabbiLessons: ready(rabbiRail(populatedRabbi, 12)), areaPreview: areaPreview(ready(areaRail(12))) },
};

// K: the rabbi row's read failed, so that whole section is absent and the
// area row follows the ticket directly.
export const RabbiRowFailed: Story = {
  decorators: [withRoute('lesson-populated', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(populatedLesson) } } },
  args: { rabbiLessons: UNAVAILABLE, areaPreview: areaPreview(ready(areaRail(6))) },
};

// A rejected promise, not just an `unavailable` result: the failed row is
// absent and neither the ticket nor the other row is lost to the route's error
// boundary.
export const RabbiRowRejected: Story = {
  decorators: [withRoute('lesson-populated', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(populatedLesson) } } },
  args: { rabbiLessons: rejectedLessons(), areaPreview: areaPreview(ready(areaRail(6))) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The rows only exist once the ticket has loaded, and a skeleton paints
    // the failed row's real heading before its rejection is handled. So wait
    // for the ticket, then for the other row's resolved rail (only a resolved
    // rail has arrows), and only then check that the failed row is gone and
    // the ticket survived the rejection.
    await expect(await canvas.findByRole('heading', { level: 1 })).toBeVisible();
    await expect(await canvas.findByLabelText(LESSONS_NEXT_LABEL)).toBeInTheDocument();
    await waitFor(() => expect(canvas.queryByRole('heading', { name: rabbiRowTitle })).toBeNull());
    await expect(canvas.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: areaRowTitle })).toBeVisible();
  },
};

export const AreaRowRejected: Story = {
  decorators: [withRoute('lesson-populated', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(populatedLesson) } } },
  args: { rabbiLessons: ready(rabbiRail(populatedRabbi, 4)), areaPreview: areaPreview(rejectedLessons()) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { level: 1 })).toBeVisible();
    await expect(await canvas.findByLabelText(LESSONS_NEXT_LABEL)).toBeInTheDocument();
    await waitFor(() => expect(canvas.queryByRole('heading', { name: areaRowTitle })).toBeNull());
    await expect(canvas.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: rabbiRowTitle })).toBeVisible();
  },
};

// Both rows failed: nothing under the ticket but the bio and the way back.
export const BothRowsFailed: Story = {
  decorators: [withRoute('lesson-populated', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(populatedLesson) } } },
  args: { rabbiLessons: UNAVAILABLE, areaPreview: areaPreview(UNAVAILABLE) },
};

// The teaching rabbi carries a poster, so the name sits in the ~162px column
// beside it rather than the full ~310px width a photoless ticket gives it,
// which is the real worst case for a long name.
export const LongRabbiName: Story = {
  decorators: [withRoute('lesson-long', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(longNamesLesson) } } },
  args: readyRows(longNamesRabbi),
};

// The occurrence request itself, not the rows: the ticket and details
// skeletons stay on screen while it is in flight.
export const OccurrenceLoading: Story = {
  decorators: [withRoute('lesson-loading', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: http.get('/v1/lessons/:lessonId/occurrences/:date', loadingResolver) } } },
};

// The lesson does not exist, or has no occurrence on this date: the
// not-found screen, with a way back to all lessons (lessonErrorCopy in
// helpers.ts).
export const OccurrenceNotFound: Story = {
  decorators: [withRoute('lesson-notfound', '2026-09-08')],
  parameters: {
    apiMocks: { handlers: { occurrence: http.get('/v1/lessons/:lessonId/occurrences/:date', errorResolver(404, 'lesson_not_found', 'לא נמצא')) } },
  },
};

// A transient failure: the same screen shape as not-found but with a retry
// action instead of a way out (lessonErrorCopy in helpers.ts).
export const OccurrenceServerError: Story = {
  decorators: [withRoute('lesson-error', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: http.get('/v1/lessons/:lessonId/occurrences/:date', errorResolver()) } } },
};
