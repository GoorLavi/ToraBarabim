import type { LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../.storybook/apiMocks';
import { LessonPage } from './LessonPage';
import type { AreaPreview, AreaPreviewLessons } from './models';

// A minimal, valid SVG portrait so every photo story stays off the network
// (mirrors LessonTicket.stories.tsx).
const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="lightgray"/></svg>',
  );

// A preview that never settles, so the `Suspense` fallback stays on screen.
const PENDING_AREA_PREVIEW_LESSONS = new Promise<AreaPreviewLessons>(() => {});

const lesson = (overrides: Partial<LessonOccurrence>): LessonOccurrence => ({
  lessonId: 'lesson-1',
  date: '2026-09-08',
  startTime: '20:30',
  endTime: '21:30',
  status: 'scheduled',
  title: 'עיונים בפרשת השבוע',
  topic: 'parasha',
  audience: 'mixed',
  rabbi: rabbiFixture({ id: 'rabbi-1', name: 'יעקב מזרחי' }),
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
  ...overrides,
});

const previewLesson = (index: number): LessonOccurrence =>
  lesson({
    lessonId: `preview-${index}`,
    rabbi: rabbiFixture({
      id: `preview-rabbi-${index}`,
      name: `רב תצוגה ${index}`,
      photoUrl: PLACEHOLDER_PHOTO,
    }),
  });

// `limit: 4` mirrors the server's `AREA_PREVIEW_LIMIT` (LessonPage/models.ts).
const areaPreview = (lessons: Promise<AreaPreviewLessons>): AreaPreview => ({
  areaName: 'השרון',
  areaSlug: 'השרון',
  limit: 4,
  lessons,
});

const occurrenceHandler = (occurrence: LessonOccurrence) => http.get('/v1/lessons/:lessonId/occurrences/:date', jsonResolver(occurrence));

const populatedLesson = lesson({
  lessonId: 'lesson-populated',
  rabbi: rabbiFixture({ id: 'rabbi-populated', name: 'יעקב מזרחי', photoUrl: PLACEHOLDER_PHOTO }),
});

const longNamesLesson = lesson({
  lessonId: 'lesson-long',
  rabbi: rabbiFixture({
    id: 'rabbi-long',
    name: 'פרופסור יהודה אריה לייב הכהן שוורצנברג-אייזנשטיין',
    photoUrl: PLACEHOLDER_PHOTO,
  }),
  place: {
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

const meta: Meta<typeof LessonPage> = {
  title: 'LessonPage/LessonPage',
  component: LessonPage,
};

export default meta;
type Story = StoryObj<typeof LessonPage>;

// A populated area preview: four cards, the phone-width count (LOCKED PLAN,
// "Card count"). The teaching rabbi carries a poster, the real worst case
// for the ticket's layout (a photoless ticket is its own, separate variant).
export const AreaPreviewPopulated: Story = {
  decorators: [withRoute('lesson-populated', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(populatedLesson) } } },
  args: { areaPreview: areaPreview(Promise.resolve({ kind: 'ready', items: [1, 2, 3, 4].map(previewLesson) })) },
};

// A promise that never resolves, so the `Suspense` fallback (the reused
// `LessonsGridSkeleton`) stays on screen (LOCKED PLAN, test plan item 4).
// Also the photoless variant (LessonTicket's "closed slot"), kept covered
// here since `AreaPreviewPopulated` and `LongRabbiName` both now carry a
// poster.
export const AreaPreviewLoading: Story = {
  decorators: [withRoute('lesson-1', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(lesson({})) } } },
  args: { areaPreview: areaPreview(PENDING_AREA_PREVIEW_LESSONS) },
};

export const AreaPreviewEmpty: Story = {
  decorators: [withRoute('lesson-1', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(lesson({})) } } },
  args: { areaPreview: areaPreview(Promise.resolve({ kind: 'ready', items: [] })) },
};

// The preview query failed: the ticket above stays correct and the section
// renders nothing (LOCKED PLAN, "which renders nothing").
export const AreaPreviewUnavailable: Story = {
  decorators: [withRoute('lesson-1', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(lesson({})) } } },
  args: { areaPreview: areaPreview(Promise.resolve({ kind: 'unavailable' })) },
};

// The teaching rabbi carries a poster, so the name sits in the ~162px column
// beside it rather than the full ~310px width a photoless ticket gives it,
// which is the real worst case for a long name.
export const LongRabbiName: Story = {
  decorators: [withRoute('lesson-long', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: occurrenceHandler(longNamesLesson) } } },
  args: { areaPreview: areaPreview(Promise.resolve({ kind: 'ready', items: [1, 2, 3, 4].map(previewLesson) })) },
};

// The occurrence request itself, not the area preview: the ticket and
// details skeletons stay on screen while it is in flight.
export const OccurrenceLoading: Story = {
  decorators: [withRoute('lesson-loading', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: http.get('/v1/lessons/:lessonId/occurrences/:date', loadingResolver) } } },
  args: { areaPreview: areaPreview(Promise.resolve({ kind: 'ready', items: [] })) },
};

// The lesson does not exist, or has no occurrence on this date: the
// not-found screen, with a way back to all lessons (lessonErrorCopy in
// helpers.ts).
export const OccurrenceNotFound: Story = {
  decorators: [withRoute('lesson-notfound', '2026-09-08')],
  parameters: {
    apiMocks: { handlers: { occurrence: http.get('/v1/lessons/:lessonId/occurrences/:date', errorResolver(404, 'lesson_not_found', 'לא נמצא')) } },
  },
  args: { areaPreview: areaPreview(Promise.resolve({ kind: 'ready', items: [] })) },
};

// A transient failure: the same screen shape as not-found but with a retry
// action instead of a way out (lessonErrorCopy in helpers.ts).
export const OccurrenceServerError: Story = {
  decorators: [withRoute('lesson-error', '2026-09-08')],
  parameters: { apiMocks: { handlers: { occurrence: http.get('/v1/lessons/:lessonId/occurrences/:date', errorResolver()) } } },
  args: { areaPreview: areaPreview(Promise.resolve({ kind: 'ready', items: [] })) },
};
