import type { City, RabbiDirectoryEntry, RabbiDirectoryResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { RabbisPage } from './RabbisPage';

const haifa: City = { id: '4000', name: 'חיפה', slug: 'חיפה', area: 'haifa' };
const beneiBrak: City = { id: '6600', name: 'בני ברק', slug: 'בני-ברק', area: 'center' };

const rabbiEntry = (id: string, name: string, cities: City[], overrides: Partial<RabbiDirectoryEntry> = {}): RabbiDirectoryEntry => ({
  ...rabbiFixture({ id, name }),
  lessonCount: 3,
  cities,
  ...overrides,
});

// Ravs, the `rabbis` directory (/rabbis).
const ravs: RabbiDirectoryEntry[] = [
  rabbiEntry('r1', 'אברהם כהן', [haifa], { lessonCount: 3 }),
  rabbiEntry('r2', 'נתן צבי אשכנזי הכהן מבני ברק', [beneiBrak], { lessonCount: 1 }),
];

// Rabbaniyot, the `rabbaniyot` directory (/women/rabbaniyot): a rabbanit's
// lessons are for women only, so this scope never mixes in a rav
// (0026, rabbaniyot-teach-women-only-and-the-honorific-is-a-field).
const rabbaniyotEntries: RabbiDirectoryEntry[] = [rabbiEntry('w1', 'שרה גולדברג', [haifa], { honorific: 'rabbanit', lessonCount: 2 })];

const directoryResponse = (items: RabbiDirectoryEntry[]): RabbiDirectoryResponse => ({ items, page: 1, pageSize: 50, total: items.length });

// The `directory` prop reaches the API as `scope`: `rabbis` maps to
// `general`, `rabbaniyot` to `women` (`useRabbiDirectory.ts`). Both are
// served from the one mock so a story only has to set `args.directory` and
// never needs its own `beforeEach`.
const meta: Meta<typeof RabbisPage> = {
  title: 'RabbisPage/RabbisPage',
  component: RabbisPage,
  // The page owns its own gutter (styles.ts); this only cancels Storybook's
  // own 16px frame padding, matching PlacesPage.
  parameters: { layout: 'fullscreen' },
  args: { directory: 'rabbis' },
  beforeEach: () =>
    installMockFetch((url) => {
      if (url.pathname === '/v1/rabbis') {
        const scope = url.searchParams.get('scope');
        return jsonResponse(200, directoryResponse(scope === 'women' ? rabbaniyotEntries : ravs));
      }
      return null;
    }),
};

export default meta;
type Story = StoryObj<typeof RabbisPage>;

export const Populated: Story = {};

// The other `directory` value: distinct page title, search label and count
// grammar (`consts.ts`'s `DIRECTORY_COPY`, `helpers.ts`'s `rabbiCountLabel`),
// so this is not the same screen with different data.
export const PopulatedRabbaniyot: Story = { args: { directory: 'rabbaniyot' } };

export const Loading: Story = {
  beforeEach: () =>
    installMockFetch((url) => {
      if (url.pathname === '/v1/rabbis') return NEVER_RESOLVES;
      return null;
    }),
};

// The board itself has no rabbis yet: distinct from a search that matches
// none of them.
export const BoardEmpty: Story = {
  beforeEach: () =>
    installMockFetch((url) => {
      if (url.pathname === '/v1/rabbis') return jsonResponse(200, directoryResponse([]));
      return null;
    }),
};

export const LoadError: Story = {
  beforeEach: () =>
    installMockFetch((url) => {
      if (url.pathname === '/v1/rabbis') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
      return null;
    }),
};

// The directory has entries, but the typed query matches none of them: the
// counter-subline fix this branch shipped (a nothing slot rather than a
// zero counter) is exercised here, the same pattern as `PlacesPage`'s own
// `SearchNoResults`.
export const SearchNoResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByRole('searchbox');
    await userEvent.type(input, 'שם שלא קיים בלוח');
  },
};
