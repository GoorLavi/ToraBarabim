import type { HomeResponse, HomeRow, LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { DEDICATION_GROUP_HEALING, DEDICATION_GROUP_MEMORIAL, DEDICATION_GROUP_SUCCESS } from '~/dedicationFixture';
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

// `dedications` defaults to none: the fetch-state stories below are about
// the page's loading/empty/error/populated states, not the dedication
// bands, which have their own stories further down.
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
  dedications: [],
  ...overrides,
});

const homeHandler = (response: HomeResponse) => http.get('/v1/home', jsonResolver(response));

const meta: Meta<typeof HomePage> = {
  title: 'HomePage/HomePage',
  component: HomePage,
  // The page owns its own gutter (styles.ts), so this only cancels
  // Storybook's own frame padding, matching every other page-level story
  // (PlacePage.stories.tsx).
  parameters: { layout: 'fullscreen' },
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

// Three real rails, the minimum the between-rails band needs
// (HomeRails/consts.ts, WOMENS_AREA_BAND_SLOT), and a positive
// `womensAreaLessonCount`, so the success band's real slot, immediately
// after the women's-area tile, is the one on screen rather than the
// tile-absent fallback slot.
const dedicationRow = (id: HomeRow['id'], title: string): HomeRow => ({
  id,
  title,
  items: [
    lesson({ lessonId: `${id}-1`, title }),
    lesson({ lessonId: `${id}-2`, title }),
    lesson({ lessonId: `${id}-3`, title }),
  ],
});

const dedicationHomeResponse = (dedications: HomeResponse['dedications']): HomeResponse => ({
  rows: [dedicationRow('area', 'שיעורים באזור שלך'), dedicationRow('today', 'הערב'), dedicationRow('weekly', 'שיעור שבועי')],
  womensAreaLessonCount: 12,
  rabbis: [RABBI_1, RABBI_2],
  dedications,
});

// The full `.band` column in page order: the success band in its real slot
// inside the rails, right after the women's-area tile, the healing band
// between the rails block and `RabbiRow`, then `RabbiRow`, `CityGrid` and
// `ContactCta`, and the memorial band last, full-bleed at the foot. No
// filters active, so the page is in rail mode (helpers.ts, resolveHomeMode).
export const AllThreeBands: Story = {
  parameters: {
    apiMocks: {
      handlers: { home: homeHandler(dedicationHomeResponse([DEDICATION_GROUP_SUCCESS, DEDICATION_GROUP_HEALING, DEDICATION_GROUP_MEMORIAL])) },
    },
  },
};

// Healing absent: no hole opens between the rails block and RabbiRow.
export const OneTypeAbsent: Story = {
  parameters: {
    apiMocks: { handlers: { home: homeHandler(dedicationHomeResponse([DEDICATION_GROUP_SUCCESS, DEDICATION_GROUP_MEMORIAL])) } },
  },
};

// Healing and memorial both absent: only the between-rails success band renders.
export const TwoTypesAbsent: Story = {
  parameters: { apiMocks: { handlers: { home: homeHandler(dedicationHomeResponse([DEDICATION_GROUP_SUCCESS])) } } },
};
