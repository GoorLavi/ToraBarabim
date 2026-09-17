import type { LessonResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { RabbiLessonsSection } from './RabbiLessonsSection';

const lesson = (overrides: Partial<LessonResponse>): LessonResponse => ({
  id: 'lesson-1',
  title: 'הלכות שבת',
  rabbiId: 'story-rabbi',
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', cityCode: 4000, cityName: 'חיפה' },
  topic: 'halacha',
  audience: 'men',
  recurrence: { kind: 'weekly', weekdays: [2] },
  startTime: '20:30',
  durationMinutes: 45,
  provenance: 'manual',
  ...overrides,
});

installMockFetch((url) => {
  if (url.pathname !== '/v1/admin/lessons') return null;

  // Prefixed `section-`, distinct from the ids `RabbiViewPage.stories.tsx`
  // uses for its own rabbi id: that file mounts this same component (via
  // `RabbiViewPage`) with the identical `{ rabbiId, pageSize: 5 }` filters
  // shape, and `.storybook/preview.tsx` shares one `QueryClient` across
  // every story, so a collision there would show one file's cached lessons
  // under the other's story.
  const rabbiId = url.searchParams.get('rabbiId');
  if (rabbiId === 'section-loading') return NEVER_RESOLVES;
  if (rabbiId === 'section-error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (rabbiId === 'section-empty') return jsonResponse(200, { items: [], page: 1, pageSize: 5, total: 0 });

  if (rabbiId === 'section-populated') {
    return jsonResponse(200, {
      items: [
        lesson({ id: 'l1', title: 'עיונים בפרשת השבוע', recurrence: { kind: 'weekly', weekdays: [5] }, startTime: '19:00' }),
        lesson({
          id: 'l2',
          title: 'שולחן ערוך אורח חיים, הלכות תפילה וברכות השחר לפרטי פרטים',
          recurrence: { kind: 'weekly', weekdays: [0, 2, 4] },
          startTime: '06:15',
          place: {
            name: 'בית מדרש אוהל יעקב, מרכז קהילתי נאות שקד',
            street: 'הרב קוק 12',
            cityCode: 4000,
            cityName: 'קריית ביאליק, אזור התעשייה הישן',
          },
        }),
        lesson({ id: 'l3', title: undefined, topic: undefined, recurrence: { kind: 'once', date: '2026-10-01' }, startTime: '21:00' }),
      ],
      page: 1,
      pageSize: 5,
      total: 3,
    });
  }

  // Falls through rather than answering every other id: `RabbiViewPage`
  // and `LessonsListPage` mock this same shared endpoint from their own
  // story files, and each file's mock chains onto the last
  // (`.storybook/preview.tsx`), so a catch-all here would swallow their
  // requests too depending on which file's module happened to load last
  // (mirrors `AreaPage.stories.tsx`'s own comment on this same trap).
  return null;
});

// This section owns its own loading/empty/error states independently of
// `RabbiViewPage`'s own profile query above it (see that page's stories for
// the "profile renders, lessons fail" case this independence exists for).
const meta: Meta<typeof RabbiLessonsSection> = {
  title: 'AdminPanel/RabbiLessonsSection',
  component: RabbiLessonsSection,
};

export default meta;
type Story = StoryObj<typeof RabbiLessonsSection>;

const rabbi = rabbiFixture({ id: 'section-populated', name: 'יעקב מזרחי' });

export const Populated: Story = { args: { rabbiId: rabbi.id, rabbiName: rabbi.name, rabbiHonorific: rabbi.honorific } };
export const Empty: Story = { args: { rabbiId: 'section-empty', rabbiName: 'שרה גולדברג', rabbiHonorific: 'rabbanit' } };
export const ServerError: Story = { args: { rabbiId: 'section-error', rabbiName: 'אברהם כהן', rabbiHonorific: 'rav' } };
export const Loading: Story = { args: { rabbiId: 'section-loading', rabbiName: 'משה לוי', rabbiHonorific: 'rav' } };
