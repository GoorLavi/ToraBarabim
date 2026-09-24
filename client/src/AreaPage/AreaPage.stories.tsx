import type { AreaDetailResponse, AreaDirectoryResponse, LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../.storybook/apiMocks';
import { AreaPage } from './AreaPage';

const areaDetail = (overrides: Partial<AreaDetailResponse>): AreaDetailResponse => ({
  area: 'haifa',
  areaName: 'חיפה והקריות',
  slug: 'חיפה-והקריות',
  cities: [
    { id: '4000', name: 'חיפה', slug: 'חיפה', area: 'haifa', lessonCount: 6 },
    { id: '4020', name: 'קריית ביאליק', slug: 'קריית-ביאליק', area: 'haifa', lessonCount: 2 },
    { id: '4030', name: 'קריית מוצקין', slug: 'קריית-מוצקין', area: 'haifa', lessonCount: 1 },
  ],
  ...overrides,
});

const lesson = (overrides: Partial<LessonOccurrence>): LessonOccurrence => ({
  lessonId: 'lesson-1',
  date: '2026-09-14',
  startTime: '20:00',
  endTime: '21:00',
  status: 'scheduled',
  title: 'הלכות שבת',
  topic: 'halacha',
  audience: 'men',
  rabbi: rabbiFixture({ id: 'r1', name: 'אליהו בן דוד' }),
  venue: { kind: 'address', name: 'בית הכנסת הגדול', street: 'שדרות הנשיא 12', city: 'חיפה', citySlug: 'חיפה', area: 'haifa' },
  ...overrides,
});

const areaDirectory = (overrides: Partial<AreaDirectoryResponse>): AreaDirectoryResponse => ({
  areas: [
    { area: 'north', areaName: 'הצפון', slug: 'הצפון', cityCount: 4, lessonCount: 9 },
    { area: 'sharon', areaName: 'השרון', slug: 'השרון', cityCount: 3, lessonCount: 5 },
  ],
  ...overrides,
});

const areaHandler = (detail: AreaDetailResponse) => http.get('/v1/areas/:slug', jsonResolver(detail));
const lessonsHandler = (items: LessonOccurrence[], total = items.length) =>
  http.get('/v1/lessons', jsonResolver({ items, page: 1, pageSize: 24, total }));

const haifaLessons: LessonOccurrence[] = [
  lesson({ lessonId: 'l1', date: '2026-09-14', startTime: '20:00' }),
  lesson({
    lessonId: 'l2',
    date: '2026-09-14',
    startTime: '06:30',
    rabbi: rabbiFixture({ id: 'r2', name: 'שמואל וקנין' }),
    title: 'שיעור דף יומי',
    topic: 'gemara',
  }),
  lesson({
    lessonId: 'l3',
    date: '2026-09-17',
    startTime: '19:30',
    audience: 'women',
    title: undefined,
    topic: undefined,
    venue: { kind: 'address', name: 'אולם קהילתי', street: 'רחוב הרצל 8', city: 'קריית ביאליק', citySlug: 'קריית-ביאליק', area: 'haifa' },
  }),
];

const sharonDetail = areaDetail({
  area: 'sharon',
  areaName: 'השרון',
  slug: 'השרון',
  cities: [
    { id: '4200', name: 'רעננה', slug: 'רעננה', area: 'sharon', lessonCount: 3 },
    { id: '4210', name: 'כפר סבא', slug: 'כפר-סבא', area: 'sharon', lessonCount: 2 },
    { id: '4220', name: 'הוד השרון', slug: 'הוד-השרון', area: 'sharon', lessonCount: 1 },
  ],
});

// See RabbiPage.stories.tsx for why this uses `Routes`'s `location` override
// instead of a second, nested MemoryRouter.
const withRoute = (areaSlug: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/areas/${encodeURIComponent(areaSlug)}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/areas/:slug" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof AreaPage> = {
  title: 'AreaPage/AreaPage',
  component: AreaPage,
  parameters: { apiMocks: { handlers: { areaDirectory: http.get('/v1/areas', jsonResolver(areaDirectory({}))) } } },
};

export default meta;
type Story = StoryObj<typeof AreaPage>;

export const Populated: Story = {
  decorators: [withRoute('חיפה-והקריות')],
  parameters: { apiMocks: { handlers: { area: areaHandler(areaDetail({})), lessons: lessonsHandler(haifaLessons, 5) } } },
};
export const CitiesButWindowEmpty: Story = {
  decorators: [withRoute('השרון')],
  parameters: { apiMocks: { handlers: { area: areaHandler(sharonDetail), lessons: lessonsHandler([]) } } },
};
export const AreaGenuinelyEmpty: Story = {
  decorators: [withRoute('הדרום')],
  parameters: {
    apiMocks: {
      handlers: {
        area: areaHandler(areaDetail({ area: 'south', areaName: 'הדרום', slug: 'הדרום', cities: [] })),
        lessons: lessonsHandler([]),
      },
    },
  },
};
export const NotFound: Story = {
  decorators: [withRoute('אזור-שלא-קיים')],
  parameters: { apiMocks: { handlers: { area: http.get('/v1/areas/:slug', errorResolver(404, 'area_not_found', 'האזור המבוקש לא נמצא')) } } },
};
export const ServerError: Story = {
  decorators: [withRoute('אזור-שגיאה')],
  parameters: { apiMocks: { handlers: { area: http.get('/v1/areas/:slug', errorResolver()) } } },
};
export const Loading: Story = {
  decorators: [withRoute('אזור-בטעינה')],
  parameters: { apiMocks: { handlers: { area: http.get('/v1/areas/:slug', loadingResolver) } } },
};
