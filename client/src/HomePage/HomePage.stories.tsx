import type { HomeResponse, HomeRow, LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../.storybook/apiMocks';
import { HomePage } from './HomePage';

// A minimal, valid SVG portrait so the photo story never touches the network.
const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="lightgray"/></svg>',
  );

const RABBI_1 = rabbiFixture({ id: 'r1', name: 'אליהו בן דוד', title: 'ראש ישיבה', photoUrl: PLACEHOLDER_PHOTO });
const RABBI_2 = rabbiFixture({ id: 'r2', name: 'שמואל וקנין' });
const RABBI_3 = rabbiFixture({ id: 'r3', name: 'נתן צבי אשכנזי הכהן', photoUrl: PLACEHOLDER_PHOTO });

const lesson = (overrides: Partial<LessonOccurrence>): LessonOccurrence => ({
  lessonId: 'lesson-1',
  date: '2026-09-22',
  startTime: '20:00',
  endTime: '21:00',
  status: 'scheduled',
  title: 'עיונים בפרשת השבוע',
  topic: 'parasha',
  audience: 'mixed',
  rabbi: RABBI_1,
  venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
  ...overrides,
});

const row = (overrides: Partial<HomeRow>): HomeRow => ({
  id: 'today',
  title: 'היום באזור שלכם',
  items: [
    lesson({ lessonId: 'l1' }),
    lesson({ lessonId: 'l2', startTime: '06:00', rabbi: RABBI_2, title: 'שיעור דף יומי', topic: 'gemara' }),
    lesson({ lessonId: 'l3', audience: 'women', title: undefined, topic: undefined }),
  ],
  ...overrides,
});

const homeResponse = (overrides: Partial<HomeResponse>): HomeResponse => ({
  rows: [
    row({}),
    row({
      id: 'weekly',
      title: 'שיעורים קבועים השבוע',
      items: [lesson({ lessonId: 'l4', rabbi: RABBI_3, date: '2026-09-24' })],
    }),
  ],
  womensAreaLessonCount: 4,
  rabbis: [RABBI_1, RABBI_2, RABBI_3],
  ...overrides,
});

const homeHandler = (response: HomeResponse) => http.get('/v1/home', jsonResolver(response));

const meta: Meta<typeof HomePage> = {
  title: 'HomePage/HomePage',
  component: HomePage,
};

export default meta;
type Story = StoryObj<typeof HomePage>;

export const Populated: Story = {
  parameters: { apiMocks: { handlers: { home: homeHandler(homeResponse({})) } } },
};
export const Empty: Story = {
  parameters: { apiMocks: { handlers: { home: homeHandler(homeResponse({ rows: [], womensAreaLessonCount: 0, rabbis: [] })) } } },
};
export const ServerError: Story = {
  parameters: { apiMocks: { handlers: { home: http.get('/v1/home', errorResolver()) } } },
};
export const Loading: Story = {
  parameters: { apiMocks: { handlers: { home: http.get('/v1/home', loadingResolver) } } },
};
