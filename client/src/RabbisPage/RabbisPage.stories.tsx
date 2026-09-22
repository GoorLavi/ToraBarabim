import type { RabbiDirectoryEntry, RabbiDirectoryResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { rabbiFixture } from '~/rabbiFixture';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../.storybook/apiMocks';
import { RabbisPage } from './RabbisPage';

const rabbiEntry = (overrides: Partial<RabbiDirectoryEntry>): RabbiDirectoryEntry => ({
  ...rabbiFixture({ id: 'r1', name: 'אברהם כהן', title: 'ראש ישיבה' }),
  lessonCount: 3,
  cities: [{ id: '4000', name: 'חיפה', slug: 'חיפה', area: 'haifa' }],
  ...overrides,
});

const directoryResponse = (items: RabbiDirectoryEntry[]): RabbiDirectoryResponse => ({ items, page: 1, pageSize: 50, total: items.length });

const rabbisHandler = (items: RabbiDirectoryEntry[]) => http.get('/v1/rabbis', jsonResolver(directoryResponse(items)));

const populatedRabbis: RabbiDirectoryEntry[] = [
  rabbiEntry({ id: 'r1', name: 'אברהם כהן' }),
  rabbiEntry({ id: 'r2', name: 'משה לוי', lessonCount: 1, cities: [{ id: '5000', name: 'ירושלים', slug: 'ירושלים', area: 'jerusalem' }] }),
  rabbiEntry({ id: 'r3', name: 'נתן צבי אשכנזי הכהן', lessonCount: 6, cities: [{ id: '4000', name: 'חיפה', slug: 'חיפה', area: 'haifa' }] }),
];

const meta: Meta<typeof RabbisPage> = {
  title: 'RabbisPage/RabbisPage',
  component: RabbisPage,
  args: { directory: 'rabbis' },
};

export default meta;
type Story = StoryObj<typeof RabbisPage>;

export const Populated: Story = {
  parameters: { apiMocks: { handlers: { rabbis: rabbisHandler(populatedRabbis) } } },
};
export const Empty: Story = {
  parameters: { apiMocks: { handlers: { rabbis: rabbisHandler([]) } } },
};
export const ServerError: Story = {
  parameters: { apiMocks: { handlers: { rabbis: http.get('/v1/rabbis', errorResolver()) } } },
};
export const Loading: Story = {
  parameters: { apiMocks: { handlers: { rabbis: http.get('/v1/rabbis', loadingResolver) } } },
};
