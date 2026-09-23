import type { LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';

import { LessonPage } from './LessonPage';
import type { AreaPreview, AreaPreviewLessons } from './models';

// No live API in Storybook's own preview server: see RabbiPage.stories.tsx
// for why every route this page calls is answered here instead.
const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// A minimal, valid SVG portrait so every photo story stays off the network
// (mirrors LessonTicket.stories.tsx).
const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="lightgray"/></svg>',
  );

const NEVER_RESOLVES = new Promise<AreaPreviewLessons>(() => {});

const installMockFetch = (respond: (url: URL) => Response | Promise<Response> | null): void => {
  const previousFetch = window.fetch;
  window.fetch = (async (input, init) => {
    const url = input instanceof Request ? new URL(input.url) : new URL(input.toString(), window.location.origin);
    const result = respond(url);
    if (result) return result;
    return previousFetch(input, init);
  }) as typeof fetch;
};

const lesson = (overrides: Partial<LessonOccurrence>): LessonOccurrence => ({
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

installMockFetch((url) => {
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/v1/lessons/lesson-1/occurrences/2026-09-08') return jsonResponse(200, lesson({}));
  if (pathname === '/v1/lessons/lesson-populated/occurrences/2026-09-08') {
    return jsonResponse(
      200,
      lesson({
        lessonId: 'lesson-populated',
        rabbi: rabbiFixture({ id: 'rabbi-populated', name: 'יעקב מזרחי', photoUrl: PLACEHOLDER_PHOTO }),
      }),
    );
  }
  if (pathname === '/v1/lessons/lesson-long/occurrences/2026-09-08') {
    return jsonResponse(
      200,
      lesson({
        lessonId: 'lesson-long',
        rabbi: rabbiFixture({
          id: 'rabbi-long',
          name: 'פרופסור יהודה אריה לייב הכהן שוורצנברג-אייזנשטיין',
          photoUrl: PLACEHOLDER_PHOTO,
        }),
        venue: {
          kind: 'address',
          name: 'בית הכנסת הגדול "היכל התורה והתפילה"',
          street: 'רחוב הרב קוק הראשי 128',
          city: 'קריית מלאכי והמושבים הסמוכים לה בעוטף עזה',
          citySlug: 'קריית-מלאכי-והמושבים-הסמוכים-לה-בעוטף-עזה',
          area: 'south',
        },
      }),
    );
  }

  return null;
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
  args: { areaPreview: areaPreview(Promise.resolve({ kind: 'ready', items: [1, 2, 3, 4].map(previewLesson) })) },
};

// A promise that never resolves, so the `Suspense` fallback (the reused
// `LessonsGridSkeleton`) stays on screen (LOCKED PLAN, test plan item 4).
// Also the photoless variant (LessonTicket's "closed slot"), kept covered
// here since `AreaPreviewPopulated` and `LongRabbiName` both now carry a
// poster.
export const AreaPreviewLoading: Story = {
  decorators: [withRoute('lesson-1', '2026-09-08')],
  args: { areaPreview: areaPreview(NEVER_RESOLVES) },
};

export const AreaPreviewEmpty: Story = {
  decorators: [withRoute('lesson-1', '2026-09-08')],
  args: { areaPreview: areaPreview(Promise.resolve({ kind: 'ready', items: [] })) },
};

// The preview query failed: the ticket above stays correct and the section
// renders nothing (LOCKED PLAN, "which renders nothing").
export const AreaPreviewUnavailable: Story = {
  decorators: [withRoute('lesson-1', '2026-09-08')],
  args: { areaPreview: areaPreview(Promise.resolve({ kind: 'unavailable' })) },
};

// The teaching rabbi carries a poster, so the name sits in the ~162px column
// beside it rather than the full ~310px width a photoless ticket gives it,
// which is the real worst case for a long name.
export const LongRabbiName: Story = {
  decorators: [withRoute('lesson-long', '2026-09-08')],
  args: { areaPreview: areaPreview(Promise.resolve({ kind: 'ready', items: [1, 2, 3, 4].map(previewLesson) })) },
};
