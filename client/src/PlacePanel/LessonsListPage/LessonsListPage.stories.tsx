import type { PlaceLessonListResponse, PlaceLessonResponse, RabbiDirectoryResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { rabbiFixture } from '~/rabbiFixture';
import { panelShellDecorator } from '~/storyDecorators';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { LessonsListPage } from './LessonsListPage';

const rabbiDirectoryEntry = (id: string, name: string) => ({ ...rabbiFixture({ id, name }), lessonCount: 1, cities: [] });

const generalDirectory: RabbiDirectoryResponse = {
  items: [
    rabbiDirectoryEntry('rabbi-1', 'אברהם כהן'),
    rabbiDirectoryEntry('rabbi-2', 'נתן צבי אשכנזי הכהן מבני ברק'),
  ],
  page: 1,
  pageSize: 50,
  total: 2,
};
const emptyDirectory: RabbiDirectoryResponse = { items: [], page: 1, pageSize: 50, total: 0 };

const lesson = (overrides: Partial<PlaceLessonResponse>): PlaceLessonResponse => ({
  id: 'l1',
  title: 'עיונים בפרשת השבוע',
  rabbiId: 'rabbi-1',
  venue: {
    kind: 'place',
    placeId: 'place-1',
    slug: 'בית-הכנסת-המרכזי-אהל-יצחק-ומאיר',
    name: 'בית הכנסת המרכזי אהל יצחק ומאיר',
    street: 'רחוב ויצמן 45',
    city: 'נתניה',
    citySlug: 'נתניה',
    area: 'sharon',
  },
  topic: 'parasha',
  audience: 'mixed',
  recurrence: { kind: 'weekly', weekdays: [2] },
  startTime: '20:30',
  durationMinutes: 60,
  provenance: 'manual',
  ...overrides,
});

const populatedLessons: PlaceLessonResponse[] = [
  lesson({ id: 'l1' }),
  lesson({
    id: 'l2',
    title: undefined,
    rabbiId: 'rabbi-2',
    topic: 'gemara',
    audience: 'men',
    recurrence: { kind: 'weekly', weekdays: [0, 1, 2, 3, 4] },
    startTime: '06:00',
  }),
];

type Scenario = 'populated' | 'empty' | 'loading' | 'error';
let scenario: Scenario = 'populated';

installMockFetch((url) => {
  if (url.pathname === '/v1/rabbis') {
    const scope = url.searchParams.get('scope');
    return jsonResponse(200, scope === 'women' ? emptyDirectory : generalDirectory);
  }

  if (url.pathname !== '/v1/place/lessons') return null;
  if (scenario === 'loading') return NEVER_RESOLVES;
  if (scenario === 'error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });

  const items = scenario === 'empty' ? [] : populatedLessons;
  const response: PlaceLessonListResponse = { items, page: 1, pageSize: 100, total: items.length };
  return jsonResponse(200, response);
});

const withScenario = (value: Scenario) => () => {
  scenario = value;
  return <LessonsListPage />;
};

const meta: Meta<typeof LessonsListPage> = {
  title: 'PlacePanel/LessonsListPage',
  component: LessonsListPage,
  // Renders inside PlaceShell's own gutter in the app; no story mounts the
  // shell, so `panelShellDecorator` stands in for it once `fullscreen`
  // cancels Storybook's own frame padding (design gate finding).
  parameters: { layout: 'fullscreen' },
  decorators: [panelShellDecorator],
};

export default meta;
type Story = StoryObj<typeof LessonsListPage>;

// A long venue name never renders here (this list has no venue tag: it is
// always this same place), but the rabbi tag carries a long name instead,
// and `l1`'s own venue fixture keeps a long place name in its data even
// though this screen does not read it, matching the design system's "a
// layout must survive real data" rule for whichever screen next reads it.
export const Populated: Story = { render: withScenario('populated') };
export const Empty: Story = { render: withScenario('empty') };
export const Loading: Story = { render: withScenario('loading') };
export const ErrorState: Story = { render: withScenario('error') };
