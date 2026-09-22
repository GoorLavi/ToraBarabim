import type { Place } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { PlacesPage } from './PlacesPage';

const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="36"><rect width="64" height="36" fill="lightgray"/></svg>');

const place = (overrides: Partial<Place>): Place => ({
  id: 'place-1',
  slug: 'בית-הכנסת-המרכזי',
  name: 'בית הכנסת המרכזי',
  street: 'רחוב ויצמן 45',
  city: 'נתניה',
  citySlug: 'נתניה',
  area: 'sharon',
  lessonCount: 3,
  ...overrides,
});

const places: Place[] = [
  place({ id: 'p1', name: 'בית הכנסת המרכזי', city: 'נתניה', photoUrl: PLACEHOLDER_PHOTO }),
  place({ id: 'p2', name: 'בית מדרש אור החיים', city: 'חיפה', citySlug: 'חיפה', area: 'haifa', street: 'הרב קוק 12' }),
  place({
    id: 'p3',
    name: 'בית הכנסת המרכזי אהל יצחק ומאיר',
    street: 'שדרות ירושלים הארוכה במיוחד לצורך הבדיקה 128',
    city: 'קריית מלאכי והמושבים הסמוכים לה בעוטף עזה',
    citySlug: 'קריית-מלאכי-והמושבים-הסמוכים-לה-בעוטף-עזה',
    area: 'south',
    floor: 'קומה 2',
  }),
];

// Baseline mock (the populated directory); per-story `beforeEach` below
// overrides it for the states that need a different server response.
// Installed/restored through `beforeEach` so it never leaks into a story
// outside this file (~/storyMocks).
const meta: Meta<typeof PlacesPage> = {
  title: 'PlacesPage/PlacesPage',
  component: PlacesPage,
  beforeEach: () =>
    installMockFetch((url) => {
      if (url.pathname === '/v1/places') return jsonResponse(200, { items: places });
      return null;
    }),
};

export default meta;
type Story = StoryObj<typeof PlacesPage>;

export const Populated: Story = {};

export const Loading: Story = {
  beforeEach: () =>
    installMockFetch((url) => {
      if (url.pathname === '/v1/places') return NEVER_RESOLVES;
      return null;
    }),
};

// The site itself has no places yet: distinct from a search that matches
// nothing.
export const BoardEmpty: Story = {
  beforeEach: () =>
    installMockFetch((url) => {
      if (url.pathname === '/v1/places') return jsonResponse(200, { items: [] });
      return null;
    }),
};

export const LoadError: Story = {
  beforeEach: () =>
    installMockFetch((url) => {
      if (url.pathname === '/v1/places') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
      return null;
    }),
};

// The directory has entries, but the typed query matches none of them: the
// shipped `/rabbis` pattern, exercised through the search field itself
// rather than a fourth mock.
export const SearchNoResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByRole('searchbox');
    await userEvent.type(input, 'שם שלא קיים בלוח');
  },
};
