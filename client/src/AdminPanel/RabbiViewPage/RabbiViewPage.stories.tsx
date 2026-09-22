import type { LessonResponse, RabbiResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../../.storybook/apiMocks';
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

const rabbiHandler = (rabbi: RabbiResponse) => http.get('/v1/admin/rabbis/:id', jsonResolver(rabbi));
const lessonsHandler = (items: LessonResponse[], total = items.length) =>
  http.get('/v1/admin/lessons', jsonResolver({ items, page: 1, pageSize: 5, total }));

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
  parameters: { apiMocks: { handlers: { lessons: lessonsHandler([]) } } },
};

export default meta;
type Story = StoryObj<typeof RabbiViewPage>;

export const Populated: Story = {
  decorators: [withRoute('story-populated')],
  parameters: { apiMocks: { handlers: { rabbi: rabbiHandler(rabbiResponse({})), lessons: lessonsHandler([lesson({}), lesson({ id: 'l2', startTime: '06:00' })]) } } },
};
export const Rabbanit: Story = {
  decorators: [withRoute('story-rabbanit')],
  parameters: {
    apiMocks: { handlers: { rabbi: rabbiHandler(rabbiResponse({ id: 'story-rabbanit', name: 'שרה גולדברג', honorific: 'rabbanit', title: 'רבנית הקהילה' })) } },
  },
};
export const NoPhoto: Story = {
  decorators: [withRoute('story-nophoto')],
  parameters: { apiMocks: { handlers: { rabbi: rabbiHandler(rabbiResponse({ id: 'story-nophoto', name: 'משה לוי', photoUrl: undefined })) } } },
};
export const NoTitleAndNoBio: Story = {
  decorators: [withRoute('story-notitlebio')],
  parameters: {
    apiMocks: {
      handlers: {
        rabbi: rabbiHandler(rabbiResponse({ id: 'story-notitlebio', name: 'דוד אברג׳יל', title: undefined, bio: undefined, photoUrl: undefined })),
      },
    },
  },
};
export const NoLessonsYet: Story = {
  decorators: [withRoute('story-emptylessons')],
  parameters: { apiMocks: { handlers: { rabbi: rabbiHandler(rabbiResponse({ id: 'story-emptylessons', name: 'אברהם כהן', photoUrl: undefined })) } } },
};
export const MoreThanCapWithSeeAll: Story = {
  decorators: [withRoute('story-manylessons')],
  parameters: {
    apiMocks: {
      handlers: {
        rabbi: rabbiHandler(rabbiResponse({ id: 'story-manylessons', name: 'נתן צבי אשכנזי הכהן', photoUrl: undefined })),
        lessons: lessonsHandler(manyLessons, 9),
      },
    },
  },
};
// The lessons section erroring while the profile above it still renders:
// `RabbiLessonsSection` owns its query independently of the profile fetch.
export const LessonsSectionFailedProfileOk: Story = {
  decorators: [withRoute('story-lessonserror')],
  parameters: {
    apiMocks: {
      handlers: {
        rabbi: rabbiHandler(rabbiResponse({ id: 'story-lessonserror', name: 'שמואל וקנין', photoUrl: undefined })),
        lessons: http.get('/v1/admin/lessons', errorResolver()),
      },
    },
  },
};
export const NotFound: Story = {
  decorators: [withRoute('story-notfound')],
  parameters: { apiMocks: { handlers: { rabbi: http.get('/v1/admin/rabbis/:id', errorResolver(404, 'rabbi_not_found', 'לא נמצא')) } } },
};
export const ServerError: Story = {
  decorators: [withRoute('story-error')],
  parameters: { apiMocks: { handlers: { rabbi: http.get('/v1/admin/rabbis/:id', errorResolver()) } } },
};
export const Loading: Story = {
  decorators: [withRoute('story-loading')],
  parameters: { apiMocks: { handlers: { rabbi: http.get('/v1/admin/rabbis/:id', loadingResolver) } } },
};
