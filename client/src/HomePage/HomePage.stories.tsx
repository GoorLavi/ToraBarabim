import type { CityWithLessonCount, HomeResponse, HomeRow, LessonOccurrence } from '@torabarabim/common';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { expect, within } from 'storybook/test';

import { courseFixture } from '~/courseFixture';
import { DEDICATION_GROUP_HEALING, DEDICATION_GROUP_MEMORIAL, DEDICATION_GROUP_SUCCESS } from '~/dedicationFixture';
import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver, respondWithJson } from '../../.storybook/apiMocks';
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

const city = (id: string, name: string, lessonCount: number, area: CityWithLessonCount['area'] = 'center'): CityWithLessonCount => ({
  id,
  name,
  slug: name,
  area,
  lessonCount,
});

const CITIES: CityWithLessonCount[] = [
  city('5000', 'תל אביב-יפו', 48, 'telAviv'),
  city('3000', 'ירושלים', 41, 'jerusalem'),
  city('4000', 'חיפה', 22, 'haifa'),
  city('7400', 'נתניה', 17, 'sharon'),
  city('70', 'באר שבע', 14, 'south'),
  city('8300', 'ראשון לציון', 12),
  city('6100', 'בני ברק', 9),
  city('1', 'קריית שמונה', 6, 'north'),
  city('2', 'מודיעין-מכבים-רעות', 4),
  city('3', 'יבנה', 1, 'shfela'),
];

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

type LessonHomeRow = Extract<HomeRow, { kind: 'lessons' }>;

const row = (overrides: Partial<Omit<LessonHomeRow, 'kind'>>): LessonHomeRow => ({
  kind: 'lessons',
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
  cities: CITIES,
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
  parameters: { apiMocks: { handlers: { home: homeHandler(homeResponse({ rows: [], womensAreaLessonCount: 0, rabbis: [], cities: [] })) } } },
};
export const ServerError: Story = {
  parameters: { apiMocks: { handlers: { home: http.get('/v1/home', errorResolver()) } } },
};
export const Loading: Story = {
  parameters: { apiMocks: { handlers: { home: http.get('/v1/home', loadingResolver) } } },
};

// The `kind: 'courses'` row, placed by the server right after the first
// lesson row (plan section 10.7).
export const WithCourseRow: Story = {
  parameters: {
    apiMocks: {
      handlers: {
        home: homeHandler(
          homeResponse({
            rows: [
              row({}),
              { kind: 'courses', id: 'courses', title: 'קורסים', items: [courseFixture({ name: 'יסודות האמונה' })] },
              row({ id: 'weekly', title: 'שיעורים קבועים השבוע', items: [lesson({ lessonId: 'l4', rabbi: RABBI_3, date: '2026-09-24' })] }),
            ],
          }),
        ),
      },
    },
  },
};

// Three real rails and a positive `womensAreaLessonCount`: with fewer rails
// than the success and healing slots (HomeRails/consts.ts), both bands clamp
// to after the last rail.
const dedicationRow = (id: LessonHomeRow['id'], title: string): LessonHomeRow => ({
  kind: 'lessons',
  id,
  title,
  items: [
    lesson({ lessonId: `${id}-1`, title }),
    lesson({ lessonId: `${id}-2`, title }),
    lesson({ lessonId: `${id}-3`, title }),
  ],
});

const dedicationHomeResponse = (dedications: HomeResponse['dedications']): HomeResponse => ({
  rows: [dedicationRow('area:sharon', 'שיעורים באזור שלך'), dedicationRow('today', 'הערב'), dedicationRow('weekly', 'שיעור שבועי')],
  womensAreaLessonCount: 12,
  rabbis: [RABBI_1, RABBI_2],
  cities: CITIES,
  dedications,
});

// The full `.band` column in page order: the success and healing bands
// clamped to after the last of three rails (success first), then
// `RabbiRow`, `CityGrid` and `ContactCta`, and the memorial band last,
// full-bleed at the foot. No filters active, so the page is in rail mode
// (helpers.ts, resolveHomeMode).
export const AllThreeBands: Story = {
  parameters: {
    apiMocks: {
      handlers: { home: homeHandler(dedicationHomeResponse([DEDICATION_GROUP_SUCCESS, DEDICATION_GROUP_HEALING, DEDICATION_GROUP_MEMORIAL])) },
    },
  },
};

// Healing absent: the success band alone closes the rails block, with no hole before RabbiRow.
export const OneTypeAbsent: Story = {
  parameters: {
    apiMocks: { handlers: { home: homeHandler(dedicationHomeResponse([DEDICATION_GROUP_SUCCESS, DEDICATION_GROUP_MEMORIAL])) } },
  },
};

// Healing and memorial both absent: only the success band renders.
export const TwoTypesAbsent: Story = {
  parameters: { apiMocks: { handlers: { home: homeHandler(dedicationHomeResponse([DEDICATION_GROUP_SUCCESS])) } } },
};

// The help tiles in the real page: one kind per row, each at the slot the
// payload names, and `ContactCta` still where it was. The women's-area tile
// sits in a row of its own, since a row never carries both.
export const WithHelpTiles: Story = {
  parameters: {
    apiMocks: {
      handlers: {
        home: homeHandler({
          rows: [
            { ...dedicationRow('area:sharon', 'שיעורים באזור שלך'), helpTile: { kind: 'rabbi-request', index: 2 } },
            { ...dedicationRow('today', 'הערב'), womensAreaTileIndex: 2 },
            { ...dedicationRow('weekly', 'שיעור שבועי'), helpTile: { kind: 'volunteer', index: 3 } },
            { ...dedicationRow('bothAudiences', 'שיעורים לכולם'), helpTile: { kind: 'share', index: 2 } },
          ],
          womensAreaLessonCount: 12,
          rabbis: [RABBI_1, RABBI_2],
          cities: CITIES,
          dedications: [],
        }),
      },
    },
  },
};

const TEN_ROW_TITLES: Array<[LessonHomeRow['id'], string]> = [
  ['today', 'שיעורים היום'],
  ['area:haifa', 'שיעורים באזור חיפה והקריות'],
  ['bothAudiences', 'שיעורים לכולם'],
  ['area:sharon', 'שיעורים באזור השרון'],
  ['weekly', 'שיעורים קבועים השבוע'],
  ['area:center', 'שיעורים באזור המרכז'],
  ['morning', 'שיעורי בוקר'],
  ['area:jerusalem', 'שיעורים באזור ירושלים'],
  ['midday', 'שיעורי צהריים'],
  ['area:south', 'שיעורים באזור הדרום'],
];

const TEN_ROWS: HomeRow[] = TEN_ROW_TITLES.map(([id, title]) => dedicationRow(id, title));

// The fullest page the server can send: ten rails with the success band
// after rail 6 and the healing band after rail 8, then the city grid with
// its counts.
export const TenRailsAllBands: Story = {
  parameters: {
    apiMocks: {
      handlers: {
        home: homeHandler({
          ...dedicationHomeResponse([DEDICATION_GROUP_SUCCESS, DEDICATION_GROUP_HEALING, DEDICATION_GROUP_MEMORIAL]),
          rows: TEN_ROWS,
        }),
      },
    },
  },
};

// A fresh dedication-free home with no cities: the grid renders nothing, heading included.
export const NoCities: Story = {
  parameters: { apiMocks: { handlers: { home: homeHandler(homeResponse({ cities: [] })) } } },
};

// Opens the preview's own MemoryRouter at a query string the filters read
// (hooks/useSelectedCity.ts), and renders nothing until it is there so the
// page never flashes its unfiltered rails first.
const StoryRoute = ({ search, children }: { search: string; children: ReactNode }): ReactNode => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    navigate({ pathname: '/', search }, { replace: true });
  }, [navigate, search]);

  return location.search === search ? children : null;
};

const SELECTED_CITY_SEARCH = '?cityId=5000&cityName=%D7%AA%D7%9C+%D7%90%D7%91%D7%99%D7%91-%D7%99%D7%A4%D7%95';

const withSelectedCity: Decorator = (Story) => (
  <StoryRoute search={SELECTED_CITY_SEARCH}>
    <Story />
  </StoryRoute>
);

// A city is chosen, so the page is in filtered mode: the results list, the
// healing band after it (it stays in filtered mode), and the grid still
// showing the home top cities with the chosen one pressed.
export const FilteredWithSelectedCity: Story = {
  decorators: [withSelectedCity],
  parameters: {
    apiMocks: {
      handlers: {
        home: homeHandler(dedicationHomeResponse([DEDICATION_GROUP_SUCCESS, DEDICATION_GROUP_HEALING, DEDICATION_GROUP_MEMORIAL])),
        lessons: http.get(
          '/v1/lessons',
          () =>
            respondWithJson({
              items: [lesson({ lessonId: 'f1' }), lesson({ lessonId: 'f2', startTime: '06:00', rabbi: RABBI_2, title: 'שיעור דף יומי', topic: 'gemara' })],
              page: 1,
              pageSize: 50,
              total: 2,
              appliedFilters: {},
            }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectedChip = await canvas.findByRole('button', { name: /תל אביב-יפו/ });

    expect(selectedChip).toHaveAttribute('aria-pressed', 'true');
    expect(canvas.getByRole('button', { name: /ירושלים/ })).toHaveAttribute('aria-pressed', 'false');
    expect((await canvas.findAllByText(/לרפואה/)).length).toBeGreaterThan(0);
  },
};
