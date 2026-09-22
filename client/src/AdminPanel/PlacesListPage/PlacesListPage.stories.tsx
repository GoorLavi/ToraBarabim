import type { AdminPlaceResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { panelShellDecorator } from '~/storyDecorators';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { PlacesListPage } from './PlacesListPage';

const place = (overrides: Partial<AdminPlaceResponse>): AdminPlaceResponse => ({
  id: 'p1',
  slug: 'p1',
  name: 'בית כנסת שלום',
  street: 'רחוב וייצמן 3',
  cityCode: 4000,
  cityName: 'חיפה',
  area: 'haifa',
  isActive: true,
  ...overrides,
});

const populatedPlaces: AdminPlaceResponse[] = [
  place({ id: 'p1' }),
  place({ id: 'p2', name: 'בית הכנסת המרכזי אהל יצחק ומאיר', street: 'שדרות ירושלים הבירה הנצחית של עם ישראל 128', cityName: 'קרית מלאכי' }),
  place({ id: 'p3', name: 'אולם קהילתי', street: 'רחוב בן גוריון 3', cityName: 'ירושלים', isActive: false }),
];

// `GET /v1/admin/places` takes no parameter that tells "populated" and
// "system genuinely empty" apart (both are an unfiltered `q`), so each
// story's own decorator sets this before mounting, mirroring
// `LessonsListPage.stories.tsx`'s `unfilteredScenario`.
type UnfilteredScenario = 'populated' | 'empty' | 'loading' | 'error';
let unfilteredScenario: UnfilteredScenario = 'populated';

installMockFetch((url) => {
  if (url.pathname !== '/v1/admin/places') return null;

  const q = url.searchParams.get('q');
  if (q === 'no-match') return jsonResponse(200, { items: [], page: 1, pageSize: 50, total: 0 });

  if (!q) {
    if (unfilteredScenario === 'loading') return NEVER_RESOLVES;
    if (unfilteredScenario === 'error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
    if (unfilteredScenario === 'empty') return jsonResponse(200, { items: [], page: 1, pageSize: 50, total: 0 });
    return jsonResponse(200, { items: populatedPlaces, page: 1, pageSize: 50, total: populatedPlaces.length });
  }

  return null;
});

const withSearch = (search: string, scenario: UnfilteredScenario = 'populated') => (Story: React.ComponentType) => {
  unfilteredScenario = scenario;
  return (
    <Routes location={{ pathname: '/admin/places', search, hash: '', state: null, key: 'story' }}>
      <Route path="/admin/places" element={<Story />} />
    </Routes>
  );
};

const meta: Meta<typeof PlacesListPage> = {
  title: 'AdminPanel/PlacesListPage',
  component: PlacesListPage,
  // Renders inside AdminShell's own gutter in the app; no story mounts the
  // shell, so `panelShellDecorator` stands in for it once `fullscreen`
  // cancels Storybook's own frame padding (design gate finding).
  parameters: { layout: 'fullscreen' },
  decorators: [panelShellDecorator],
};

export default meta;
type Story = StoryObj<typeof PlacesListPage>;

export const Populated: Story = { decorators: [withSearch('')] };
export const NoMatchingSearch: Story = { decorators: [withSearch('?q=no-match')] };
export const SystemEmpty: Story = { decorators: [withSearch('', 'empty')] };
export const Loading: Story = { decorators: [withSearch('', 'loading')] };
export const ServerError: Story = { decorators: [withSearch('', 'error')] };
